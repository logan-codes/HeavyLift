"""Feature engineering shared by anomaly detection (on-demand + streaming) and maintenance
risk prediction. Extracted from anomaly.py so the per-reading deltas aren't computed twice
in two slightly-diverging ways."""

from dataclasses import dataclass

from app.geo import haversine_km


@dataclass
class TelemetryFeatures:
    dt_hours: float
    distance_km: float
    speed_kmh: float
    fuel_delta: float | None
    health_delta: float | None


def compute_telemetry_features(prev: dict, curr: dict) -> TelemetryFeatures:
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

    return TelemetryFeatures(dt_hours, distance_km, speed_kmh, fuel_delta, health_delta)


def fetch_previous_reading(conn, equipment_id: int) -> dict | None:
    """Second-most-recent usage_history row for this equipment — the most recent one is the
    event currently being processed, already inserted by the backend before it published to Kafka."""
    return conn.execute(
        """
        SELECT recorded_at, latitude, longitude, fuel_gauge, health
        FROM usage_history
        WHERE equipment_id = %s
        ORDER BY recorded_at DESC
        OFFSET 1 LIMIT 1
        """,
        (equipment_id,),
    ).fetchone()
