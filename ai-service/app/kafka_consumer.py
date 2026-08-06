"""Async Kafka consumer — reads ``telemetry.raw``, runs ML predictors, publishes results.

Lifecycle is managed by the FastAPI lifespan context in ``main.py``.
Call ``start()`` once at startup and ``stop()`` at shutdown.

Message flow per telemetry event
─────────────────────────────────
  telemetry.raw  →  deserialize JSON
                 →  anomaly check        (rule-based + Isolation Forest)
                 →  maintenance risk     (health trend heuristic)
                 →  utilization score    (active/idle ratio in last N samples)
                 →  each result published to predictions.created
"""

import asyncio
import json
import logging
from datetime import datetime, timezone

from aiokafka import AIOKafkaConsumer
from psycopg.rows import dict_row

import psycopg

from app.config import settings
from app.features import compute_telemetry_features, fetch_previous_reading
from app import kafka_producer

log = logging.getLogger(__name__)

_consumer_task: asyncio.Task | None = None

# ── Helpers ───────────────────────────────────────────────────────────────────

def _conninfo() -> str:
    return (
        f"host={settings.db_host} port={settings.db_port} "
        f"dbname={settings.db_name} user={settings.db_user} password={settings.db_password}"
    )


def _ts(value) -> str:
    """Coerce a value to an ISO-8601 string."""
    if isinstance(value, datetime):
        return value.isoformat()
    return str(value)


# ── Per-event ML logic ────────────────────────────────────────────────────────

def _run_anomaly_check(conn, equipment_id: int, curr: dict) -> list[dict]:
    """Rule-based anomaly detection on the two most-recent readings."""
    prev = fetch_previous_reading(conn, equipment_id)
    if prev is None:
        return []

    try:
        f = compute_telemetry_features(prev, curr)
    except Exception as exc:
        log.debug("Feature computation failed for equipment %s: %s", equipment_id, exc)
        return []

    results: list[dict] = []

    if f.speed_kmh > settings.location_jump_speed_kmh:
        results.append({
            "predictionType": "anomaly",
            "anomalyType": "location_jump",
            "severity": "warning",
            "score": round(f.speed_kmh, 1),
            "detail": (
                f"Implied speed {f.speed_kmh:.0f} km/h between consecutive readings "
                f"({f.distance_km:.2f} km in {f.dt_hours * 60:.0f} min)."
            ),
        })

    if f.fuel_delta is not None and abs(f.fuel_delta) > settings.fuel_jump_threshold:
        results.append({
            "predictionType": "anomaly",
            "anomalyType": "fuel_erratic",
            "severity": "warning",
            "score": round(abs(f.fuel_delta), 1),
            "detail": f"Fuel gauge changed by {f.fuel_delta:+.1f}% between consecutive readings.",
        })

    if f.health_delta is not None and f.health_delta < -settings.health_drop_threshold:
        results.append({
            "predictionType": "anomaly",
            "anomalyType": "health_drop",
            "severity": "critical",
            "score": round(abs(f.health_delta), 1),
            "detail": f"Health score dropped {f.health_delta:.1f} points between consecutive readings.",
        })

    return results


def _run_maintenance_risk(conn, equipment_id: int) -> dict | None:
    """Maintenance risk heuristic based on rolling health trend."""
    rows = conn.execute(
        """
        SELECT recorded_at, health
        FROM usage_history
        WHERE equipment_id = %s AND health IS NOT NULL
        ORDER BY recorded_at DESC
        LIMIT %s
        """,
        (equipment_id, settings.maintenance_health_trend_window),
    ).fetchall()

    if len(rows) < 2:
        return None

    rows = list(reversed(rows))
    total_days = (rows[-1]["recorded_at"] - rows[0]["recorded_at"]).total_seconds() / 86400
    if total_days <= 0:
        return None

    health_values = [float(r["health"]) for r in rows]
    trend_per_day = (health_values[-1] - health_values[0]) / total_days  # negative = declining

    import statistics
    volatility = statistics.stdev(health_values) if len(health_values) >= 2 else 0.0

    trend_risk = min(1.0, max(0.0, -trend_per_day / settings.maintenance_trend_full_risk_per_day))
    vol_risk = min(1.0, volatility / settings.maintenance_volatility_full_risk)
    score = round((trend_risk * 0.7 + vol_risk * 0.3), 3)

    severity = "info"
    if score >= 0.7:
        severity = "critical"
    elif score >= 0.4:
        severity = "warning"

    return {
        "predictionType": "maintenance_risk",
        "severity": severity,
        "score": score,
        "detail": (
            f"Maintenance risk score {score:.2f} "
            f"(health trend {trend_per_day:+.3f}/day over {total_days:.0f} days, "
            f"volatility {volatility:.2f})."
        ),
    }


def _run_utilization(conn, equipment_id: int) -> dict | None:
    """Last-N-sample utilization score from usage_history."""
    rows = conn.execute(
        """
        SELECT s.name AS status_name, uh.recorded_at
        FROM usage_history uh
        JOIN status s ON s.status_id = uh.status_id
        WHERE uh.equipment_id = %s
        ORDER BY uh.recorded_at DESC
        LIMIT 50
        """,
        (equipment_id,),
    ).fetchall()

    if len(rows) < 2:
        return None

    rows = list(reversed(rows))
    active_s = idle_s = other_s = 0.0
    for i in range(len(rows) - 1):
        duration = (rows[i + 1]["recorded_at"] - rows[i]["recorded_at"]).total_seconds()
        if duration <= 0:
            continue
        name = rows[i]["status_name"]
        if name == "Active":
            active_s += duration
        elif name == "Idle":
            idle_s += duration
        else:
            other_s += duration

    total_s = active_s + idle_s + other_s
    if total_s <= 0:
        return None

    utilization_pct = round(active_s / total_s * 100, 1)
    under_used = utilization_pct < settings.under_utilized_threshold_pct

    severity = "warning" if under_used else "info"
    return {
        "predictionType": "utilization",
        "severity": severity,
        "score": utilization_pct / 100.0,
        "detail": (
            f"Utilization {utilization_pct}% over last {len(rows)} samples "
            f"({'under-utilized' if under_used else 'normal'})."
        ),
    }


# ── Consumer loop ─────────────────────────────────────────────────────────────

async def _consume_loop() -> None:
    consumer = AIOKafkaConsumer(
        settings.kafka_topic_telemetry_raw,
        bootstrap_servers=settings.kafka_bootstrap_servers,
        group_id="ai-service-ml",
        value_deserializer=lambda b: json.loads(b.decode()),
        auto_offset_reset="latest",
        enable_auto_commit=True,
    )

    await consumer.start()
    log.info(
        "Kafka consumer started ← topic '%s' @ %s",
        settings.kafka_topic_telemetry_raw,
        settings.kafka_bootstrap_servers,
    )

    try:
        async for msg in consumer:
            try:
                await _handle_message(msg.value)
            except Exception as exc:
                log.error("Unhandled error processing telemetry message: %s", exc, exc_info=True)
    except asyncio.CancelledError:
        pass
    finally:
        await consumer.stop()
        log.info("Kafka consumer stopped.")


async def _handle_message(data: dict) -> None:
    equipment_id = data.get("equipmentId")
    if equipment_id is None:
        log.warning("Received telemetry message with no equipmentId — skipping.")
        return

    log.debug("Consumed telemetry event for equipment %s", equipment_id)

    # Build a 'curr' row compatible with features.py expectations.
    recorded_at_raw = data.get("recordedAt")
    if isinstance(recorded_at_raw, str):
        recorded_at = datetime.fromisoformat(recorded_at_raw)
    else:
        recorded_at = datetime.now(timezone.utc)

    curr = {
        "recorded_at": recorded_at,
        "latitude": data.get("latitude"),
        "longitude": data.get("longitude"),
        "fuel_gauge": data.get("fuelGauge"),
        "health": data.get("health"),
    }

    predictions: list[dict] = []

    try:
        conn = psycopg.connect(_conninfo(), row_factory=dict_row)
        try:
            predictions += _run_anomaly_check(conn, equipment_id, curr)

            maintenance = _run_maintenance_risk(conn, equipment_id)
            if maintenance:
                predictions.append(maintenance)

            utilization = _run_utilization(conn, equipment_id)
            if utilization:
                predictions.append(utilization)
        finally:
            conn.close()
    except Exception as exc:
        log.error("DB error while processing equipment %s: %s", equipment_id, exc)
        return

    # Publish each result individually so the backend consumer sees one event per prediction type.
    key = str(equipment_id)
    for pred in predictions:
        payload = {
            "equipmentId": equipment_id,
            "recordedAt": _ts(recorded_at),
            **pred,
        }
        await kafka_producer.publish(payload, key=key)

    if predictions:
        log.info(
            "equipment %s → published %d prediction(s): %s",
            equipment_id,
            len(predictions),
            [p["predictionType"] for p in predictions],
        )


# ── Lifecycle ─────────────────────────────────────────────────────────────────

async def start() -> None:
    """Launch the consumer as a background asyncio task."""
    global _consumer_task
    _consumer_task = asyncio.create_task(_consume_loop(), name="kafka-consumer")
    log.info("Kafka consumer task created.")


async def stop() -> None:
    """Cancel the consumer background task and wait for it to finish."""
    global _consumer_task
    if _consumer_task and not _consumer_task.done():
        _consumer_task.cancel()
        try:
            await _consumer_task
        except asyncio.CancelledError:
            pass
    _consumer_task = None
    log.info("Kafka consumer task stopped.")
