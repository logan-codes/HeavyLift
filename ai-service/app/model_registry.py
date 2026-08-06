"""
model_registry.py — HeavyLift AI Service
=========================================
Scans data/processed/models/ at startup and loads all per-machine-type
LightGBM/XGBoost joblib bundles into memory.

Each bundle is a dict::

    {
        "machine_type": str,
        "features":     list[str],
        "models": {
            "Failure_Flag":     sklearn Pipeline,
            "Maintenance_Flag": sklearn Pipeline,
        }
    }

Public API::

    from app.model_registry import ModelRegistry
    registry = ModelRegistry()          # call once at startup
    result = registry.predict("Mining Truck", feature_dict)
    # result → {"failure_prob": 0.72, "maintenance_prob": 0.38, "model": "lgbm"}
"""

import logging
import os
import re
from typing import Optional

import joblib
import numpy as np

log = logging.getLogger(__name__)

# ── feature list must match train.py ─────────────────────────────────────────
FEATURES = [
    "Metric_1", "Metric_2", "Metric_3", "Metric_4",
    "Metric_5", "Metric_6", "Metric_7", "Metric_8",
    "Engine_Hours_Total", "Fuel_Level", "Operating_Hours", "Idle_Hours",
]

# Kafka payload field → CSV feature column name mapping
_FIELD_MAP = {
    "metric1":        "Metric_1",
    "metric2":        "Metric_2",
    "metric3":        "Metric_3",
    "metric4":        "Metric_4",
    "metric5":        "Metric_5",
    "metric6":        "Metric_6",
    "metric7":        "Metric_7",
    "metric8":        "Metric_8",
    "engineHours":    "Engine_Hours_Total",
    "fuelGauge":      "Fuel_Level",
    "operatingHours": "Operating_Hours",
    "idleHours":      "Idle_Hours",
}


def _slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")


class ModelRegistry:
    """Loads and caches all per-machine-type ML models from joblib files."""

    def __init__(self, models_dir: Optional[str] = None) -> None:
        if models_dir is None:
            models_dir = os.path.join(
                os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                "data", "processed", "models",
            )
        self._models_dir = models_dir
        self._registry: dict[str, dict] = {}
        self._load_all()

    def _load_all(self) -> None:
        if not os.path.isdir(self._models_dir):
            log.warning("Models directory not found: %s — ML inference disabled.", self._models_dir)
            return

        loaded = 0
        for fname in os.listdir(self._models_dir):
            if not fname.endswith(".joblib"):
                continue
            path = os.path.join(self._models_dir, fname)
            try:
                bundle = joblib.load(path)
                mtype = bundle.get("machine_type", fname.replace(".joblib", ""))
                self._registry[mtype.lower()] = bundle
                loaded += 1
                log.info("Loaded model: %s (%s)", mtype, fname)
            except Exception as exc:
                log.error("Failed to load %s: %s", fname, exc)

        log.info("ModelRegistry: %d model(s) loaded from %s", loaded, self._models_dir)

    @property
    def is_empty(self) -> bool:
        return len(self._registry) == 0

    def available_types(self) -> list[str]:
        return list(self._registry.keys())

    def predict(self, machine_type: str, telemetry: dict) -> Optional[dict]:
        """
        Run ML inference for a single telemetry reading.

        Parameters
        ----------
        machine_type : str
            Equipment category name (e.g. "Mining Truck").
        telemetry : dict
            Kafka payload fields (camelCase), e.g. {"metric1": 72.3, "fuelGauge": 45.1, ...}.

        Returns
        -------
        dict | None
            {"failure_prob": float, "maintenance_prob": float}
            Returns None if no model exists for this type or features are missing.
        """
        bundle = self._registry.get(machine_type.lower())
        if bundle is None:
            log.debug("No model for machine type: %s", machine_type)
            return None

        # Build feature vector
        feature_values = []
        for feat in FEATURES:
            # find camelCase key that maps to this CSV column
            camel_key = next(
                (k for k, v in _FIELD_MAP.items() if v == feat), None
            )
            val = telemetry.get(camel_key) if camel_key else None
            if val is None:
                # feature missing — skip prediction (model wasn't trained with NaNs)
                log.debug(
                    "Missing feature '%s' (key='%s') for %s — skipping ML inference",
                    feat, camel_key, machine_type,
                )
                return None
            feature_values.append(float(val))

        X = np.array(feature_values).reshape(1, -1)
        models = bundle.get("models", {})
        result: dict = {}

        for label, pipeline in models.items():
            try:
                prob = float(pipeline.predict_proba(X)[0, 1])
                key = "failure_prob" if "Failure" in label else "maintenance_prob"
                result[key] = round(prob, 4)
            except Exception as exc:
                log.warning("predict_proba failed for %s/%s: %s", machine_type, label, exc)

        return result if result else None
