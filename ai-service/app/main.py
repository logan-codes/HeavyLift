from contextlib import asynccontextmanager

from fastapi import FastAPI

from app import kafka_consumer, kafka_producer
from app.routers import anomaly, forecast, predict_return, utilization


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start Kafka producer + consumer on startup; shut them down cleanly on exit."""
    await kafka_producer.start()
    await kafka_consumer.start()
    yield
    await kafka_consumer.stop()
    await kafka_producer.stop()


app = FastAPI(title="Cat Rental AI Service", version="0.1.0", lifespan=lifespan)

app.include_router(utilization.router)
app.include_router(anomaly.router)
app.include_router(forecast.router)
app.include_router(predict_return.router)


@app.get("/health")
def health():
    """Unauthenticated liveness check the Java backend polls before calling AI endpoints."""
    return {"status": "ok"}
