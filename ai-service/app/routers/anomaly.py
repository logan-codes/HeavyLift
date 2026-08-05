from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.config import settings
from app.db import get_connection
from app.geo import haversine_km
from app.security import verify_shared_secret

router = APIRouter(prefix="/anomaly-check", tags=["anomaly"], dependencies=[Depends(verify_shared_secret)])


class Anomaly(BaseModel):
    recorded_at: str
    anomaly_type: str
    detail: str
    severity: str


class AnomalyResponse(BaseModel):
    equipment_id: int
    sample_count: int
    anomalies: list[Anomaly]


@router.get("/{equipment_id}", response_model=AnomalyResponse)
def check_anomalies(equipment_id: int, limit: int = 50):
    with get_connection() as conn:
        exists = conn.execute("SELECT 1 FROM equipment WHERE equipment_id = %s", (equipment_id,)).fetchone()
        if not exists:
            raise HTTPException(status_code=404, detail=f"No equipment with id {equipment_id}")

        rows = conn.execute(
            """
            SELECT recorded_at, latitude, longitude, fuel_gauge, health
            FROM usage_history
            WHERE equipment_id = %s
            ORDER BY recorded_at DESC
            LIMIT %s
            """,
            (equipment_id, limit),
        ).fetchall()

    rows = list(reversed(rows))  # chronological order
    anomalies: list[Anomaly] = []

    if len(rows) < 2:
        return AnomalyResponse(equipment_id=equipment_id, sample_count=len(rows), anomalies=anomalies)

    features = []  # (index, fuel_delta, health_delta, distance_km)
    for i in range(1, len(rows)):
        prev, curr = rows[i - 1], rows[i]
        dt_hours = (curr["recorded_at"] - prev["recorded_at"]).total_seconds() / 3600.0
        distance_km = haversine_km(
            float(prev["latitude"]) if prev["latitude"] is not None else None,
            float(prev["longitude"]) if prev["longitude"] is not None else None,
            float(curr["latitude"]) if curr["latitude"] is not None else None,
            float(curr["longitude"]) if curr["longitude"] is not None else None,
        )
        speed_kmh = distance_km / dt_hours if dt_hours > 0 else 0.0

        fuel_delta = None
        if prev["fuel_gauge"] is not None and curr["fuel_gauge"] is not None:
            fuel_delta = float(curr["fuel_gauge"]) - float(prev["fuel_gauge"])

        health_delta = None
        if prev["health"] is not None and curr["health"] is not None:
            health_delta = float(curr["health"]) - float(prev["health"])

        features.append((i, fuel_delta or 0.0, health_delta or 0.0, distance_km))

        recorded_at_str = curr["recorded_at"].isoformat()

        if speed_kmh > settings.location_jump_speed_kmh:
            anomalies.append(Anomaly(
                recorded_at=recorded_at_str,
                anomaly_type="location_jump",
                detail=f"Implied speed {speed_kmh:.0f} km/h between consecutive readings "
                       f"({distance_km:.2f} km in {dt_hours * 60:.0f} min) is inconsistent with normal movement.",
                severity="high",
            ))

        if fuel_delta is not None and abs(fuel_delta) > settings.fuel_jump_threshold:
            anomalies.append(Anomaly(
                recorded_at=recorded_at_str,
                anomaly_type="fuel_erratic",
                detail=f"Fuel gauge changed by {fuel_delta:+.1f}% between consecutive readings.",
                severity="medium",
            ))

        if health_delta is not None and health_delta < -settings.health_drop_threshold:
            anomalies.append(Anomaly(
                recorded_at=recorded_at_str,
                anomaly_type="health_drop",
                detail=f"Health score dropped {health_delta:.1f} points between consecutive readings.",
                severity="high",
            ))

    # Statistical pass with Isolation Forest once there's enough data for it to be meaningful.
    if len(features) >= 10:
        try:
            import numpy as np
            from sklearn.ensemble import IsolationForest

            matrix = np.array([[f[1], f[2], f[3]] for f in features])
            model = IsolationForest(contamination=0.1, random_state=42)
            predictions = model.fit_predict(matrix)

            flagged_indices = {f[0] for f, p in zip(features, predictions) if p == -1}
            already_flagged_times = {a.recorded_at for a in anomalies}

            for idx in flagged_indices:
                row = rows[idx]
                recorded_at_str = row["recorded_at"].isoformat()
                if recorded_at_str not in already_flagged_times:
                    anomalies.append(Anomaly(
                        recorded_at=recorded_at_str,
                        anomaly_type="ml_outlier",
                        detail="Isolation Forest flagged this reading as a statistical outlier across "
                               "fuel/health/location movement combined.",
                        severity="medium",
                    ))
        except ImportError:
            pass  # scikit-learn/numpy not installed; rule-based anomalies above still apply.

    anomalies.sort(key=lambda a: a.recorded_at)
    return AnomalyResponse(equipment_id=equipment_id, sample_count=len(rows), anomalies=anomalies)
