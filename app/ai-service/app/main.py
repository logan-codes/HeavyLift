from fastapi import FastAPI

from app.routers import anomaly, forecast, predict_return, utilization

app = FastAPI(title="Cat Rental AI Service", version="0.1.0")

app.include_router(utilization.router)
app.include_router(anomaly.router)
app.include_router(forecast.router)
app.include_router(predict_return.router)


@app.get("/health")
def health():
    """Unauthenticated liveness check the Java backend polls before calling AI endpoints."""
    return {"status": "ok"}
