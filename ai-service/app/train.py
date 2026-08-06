"""
HeavyLift — Per-Machine-Type LightGBM/XGBoost Predictive Engine
================================================================
Trains two classifiers per machine type from heavy_equipment_dataset.csv:
  - Failure_Flag    (equipment breakdown / anomaly)
  - Maintenance_Flag (scheduled maintenance required)

Outputs: ai-service/data/processed/models/<machine_type_slug>.joblib
         Each joblib bundle = {"failure": Pipeline, "maintenance": Pipeline, "type": str}

Run:
    python app/train.py
"""

import os
import re
import time
import warnings

import joblib
import numpy as np
import pandas as pd
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline
from lightgbm import LGBMClassifier
from sklearn.metrics import (
    classification_report,
    roc_auc_score,
    precision_recall_curve,
    average_precision_score,
)
from sklearn.model_selection import StratifiedKFold, cross_val_predict
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier

warnings.filterwarnings("ignore")

# ── Paths ─────────────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_CSV = os.path.join(BASE_DIR, "data", "raw", "heavy_equipment_dataset.csv")
MODELS_DIR = os.path.join(BASE_DIR, "data", "processed", "models")
os.makedirs(MODELS_DIR, exist_ok=True)

# ── Features & Targets ────────────────────────────────────────────────────────
FEATURES = [
    "Metric_1", "Metric_2", "Metric_3", "Metric_4",
    "Metric_5", "Metric_6", "Metric_7", "Metric_8",
    "Engine_Hours_Total", "Fuel_Level", "Operating_Hours", "Idle_Hours",
]
TARGETS = ["Failure_Flag", "Maintenance_Flag"]


def slug(name: str) -> str:
    """Convert 'Mining Truck' → 'mining_truck' for use as a filename."""
    return re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")


# ── EDA Summary ───────────────────────────────────────────────────────────────
def print_eda(df: pd.DataFrame) -> None:
    print("=" * 70)
    print("EDA SUMMARY")
    print("=" * 70)
    print(f"Total rows : {len(df):,}")
    print(f"Columns    : {df.columns.tolist()}")
    print(f"\nMachine types ({df['Machine_Type'].nunique()}):")
    print(df["Machine_Type"].value_counts().to_string())
    print(f"\nFailure_Flag     — total positives: {df['Failure_Flag'].sum()} "
          f"({df['Failure_Flag'].mean()*100:.3f}%)")
    print(f"Maintenance_Flag — total positives: {df['Maintenance_Flag'].sum()} "
          f"({df['Maintenance_Flag'].mean()*100:.2f}%)")
    print()


# ── Model Builders ────────────────────────────────────────────────────────────
def make_lgbm(label: str) -> ImbPipeline:
    return ImbPipeline([
        ("smote", SMOTE(random_state=42)),
        ("scaler", StandardScaler()),
        ("clf", LGBMClassifier(
            n_estimators=300,
            learning_rate=0.05,
            max_depth=6,
            num_leaves=31,
            subsample=0.8,
            colsample_bytree=0.8,
            class_weight="balanced",
            random_state=42,
            verbose=-1,
        )),
    ])


def make_xgb(label: str) -> ImbPipeline:
    return ImbPipeline([
        ("smote", SMOTE(random_state=42)),
        ("scaler", StandardScaler()),
        ("clf", XGBClassifier(
            n_estimators=300,
            learning_rate=0.05,
            max_depth=6,
            subsample=0.8,
            colsample_bytree=0.8,
            scale_pos_weight=10,   # extra boost for positive class
            eval_metric="logloss",
            random_state=42,
            verbosity=0,
        )),
    ])


# ── Per-type Training Loop ────────────────────────────────────────────────────
def train_one_type(machine_type: str, df_type: pd.DataFrame) -> dict | None:
    """Train Failure + Maintenance classifiers for one machine type."""
    df_type = df_type.dropna(subset=FEATURES + TARGETS)
    X = df_type[FEATURES].values
    n = len(df_type)

    if n < 50:
        print(f"  ⚠  Skipping {machine_type} — only {n} rows after dropna.")
        return None

    results = {}
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

    for target in TARGETS:
        y = df_type[target].values
        pos = y.sum()
        print(f"  [{target}] n={n:,}  positives={int(pos)} ({pos/n*100:.2f}%)")

        if pos < 5:
            # Too few positives for SMOTE (needs k_neighbors=5)
            print(f"     → Too few positives, using LightGBM without SMOTE.")
            pipeline = ImbPipeline([
                ("scaler", StandardScaler()),
                ("clf", LGBMClassifier(
                    class_weight="balanced", random_state=42, verbose=-1)),
            ])
            pipeline.fit(X, y)
            results[target] = pipeline
            continue

        # Evaluate LightGBM vs XGBoost via 5-fold CV (AP score)
        scores = {}
        for name, factory in [("lgbm", make_lgbm), ("xgb", make_xgb)]:
            pipe = factory(target)
            try:
                y_prob = cross_val_predict(
                    pipe, X, y, cv=cv, method="predict_proba", n_jobs=1
                )[:, 1]
                ap = average_precision_score(y, y_prob)
                roc = roc_auc_score(y, y_prob)
                scores[name] = (ap, roc, pipe)
                print(f"     {name.upper():5s} → AP={ap:.3f}  ROC-AUC={roc:.3f}")
            except Exception as e:
                print(f"     {name.upper():5s} → failed: {e}")

        if not scores:
            print(f"     Both models failed — skipping {target}")
            continue

        # Pick winner by average precision (better for imbalanced data)
        best_name = max(scores, key=lambda k: scores[k][0])
        best_ap, best_roc, best_pipe = scores[best_name]
        print(f"     ✓ Winner: {best_name.upper()} (AP={best_ap:.3f})")

        # Retrain winner on full data
        best_pipe.fit(X, y)

        # Final report on training set
        y_pred = best_pipe.predict(X)
        print(classification_report(y, y_pred, zero_division=0))

        results[target] = best_pipe

    return results


# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    t0 = time.time()
    print(f"Loading dataset from:\n  {RAW_CSV}\n")
    df = pd.read_csv(RAW_CSV)
    print_eda(df)

    machine_types = sorted(df["Machine_Type"].unique())
    saved = 0

    for mtype in machine_types:
        print(f"\n{'─' * 60}")
        print(f"  Training: {mtype}")
        print(f"{'─' * 60}")
        df_type = df[df["Machine_Type"] == mtype].copy()
        model_bundle = train_one_type(mtype, df_type)
        if not model_bundle:
            continue

        out_path = os.path.join(MODELS_DIR, f"{slug(mtype)}.joblib")
        joblib.dump({"machine_type": mtype, "models": model_bundle, "features": FEATURES}, out_path)
        print(f"  ✅ Saved → {out_path}")
        saved += 1

    elapsed = time.time() - t0
    print(f"\n{'=' * 70}")
    print(f"Training complete.  {saved}/{len(machine_types)} models saved.  "
          f"Elapsed: {elapsed:.1f}s")
    print(f"Models directory: {MODELS_DIR}")
    print("=" * 70)


if __name__ == "__main__":
    main()
