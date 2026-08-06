"""Async Kafka producer — publishes prediction results to ``predictions.created``.

Lifecycle is managed by the FastAPI lifespan context in ``main.py``.
Call ``start()`` once at startup and ``stop()`` at shutdown.
Use ``publish(payload)`` to send a single prediction dict.
"""

import json
import logging

from aiokafka import AIOKafkaProducer

from app.config import settings

log = logging.getLogger(__name__)

_producer: AIOKafkaProducer | None = None


def _serializer(value: dict) -> bytes:
    return json.dumps(value, default=str).encode()


async def start() -> None:
    """Start the Kafka producer. Called once during FastAPI lifespan startup."""
    global _producer
    _producer = AIOKafkaProducer(
        bootstrap_servers=settings.kafka_bootstrap_servers,
        value_serializer=_serializer,
        key_serializer=lambda k: k.encode() if k else None,
    )
    await _producer.start()
    log.info("Kafka producer started → %s", settings.kafka_bootstrap_servers)


async def stop() -> None:
    """Flush and close the Kafka producer. Called during FastAPI lifespan shutdown."""
    global _producer
    if _producer:
        await _producer.stop()
        _producer = None
        log.info("Kafka producer stopped.")


async def publish(payload: dict, key: str | None = None) -> None:
    """Publish a single prediction dict to the ``predictions.created`` topic.

    Args:
        payload: The prediction result dict to serialise as JSON.
        key:     Optional partition key (e.g. str(equipment_id)).
    """
    if _producer is None:
        log.warning("Kafka producer is not running — skipping publish.")
        return
    try:
        await _producer.send_and_wait(
            settings.kafka_topic_predictions_created,
            value=payload,
            key=key,
        )
    except Exception as exc:
        log.error("Failed to publish prediction to Kafka: %s", exc)
