from fastapi import FastAPI

from app.routers import seed, stream

app = FastAPI(
    title="HeavyLift Data Generator",
    description="On-demand DB seeder and live telemetry simulation server.",
    version="0.1.0",
)

app.include_router(seed.router)
app.include_router(stream.router)


@app.get("/health")
def health():
    """Liveness probe used by Docker and docker-compose healthchecks."""
    return {"status": "ok"}
