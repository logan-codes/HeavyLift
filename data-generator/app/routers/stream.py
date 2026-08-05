"""Live telemetry streaming — async reimplementation of stream_live.py.

Endpoints:
    POST /stream/start  — begin streaming in the background
    POST /stream/stop   — cancel the background task
    GET  /stream/status — check whether streaming is running
"""

import asyncio
import random
from typing import Annotated

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.common import API_BASE_URL, DEVICE_API_KEY, EQUIPMENT_STATUS_ACTIVE, EQUIPMENT_STATUS_IDLE, db_connect

router = APIRouter(prefix="/stream", tags=["stream"])

# ── Module-level state ────────────────────────────────────────────────────────

_task: asyncio.Task | None = None
_iterations_done: int = 0

JITTER_DEG = 0.0006  # ~60 m — keeps implied speed under the AI anomaly threshold


# ── Pydantic models ───────────────────────────────────────────────────────────

class StreamStartRequest(BaseModel):
    iterations: Annotated[int, Field(ge=0)] = 0
    """Number of telemetry rounds to post.  0 = run indefinitely."""
    interval_seconds: Annotated[float, Field(gt=0)] = 15.0


class StreamStatusResponse(BaseModel):
    running: bool
    iterations_done: int
    api_base_url: str


# ── Helpers ───────────────────────────────────────────────────────────────────

def _fetch_active_equipment() -> list[dict]:
    """Blocking DB call — called once at stream start from the async task."""
    conn = db_connect()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT r.equipment_id, ur.latitude, ur.longitude, ur.operator_id, ur.fuel_gauge, e.health
                FROM rentals r
                JOIN equipment e ON e.equipment_id = r.equipment_id
                LEFT JOIN usage_realtime ur ON ur.equipment_id = r.equipment_id
                WHERE r.is_active = TRUE
                """
            )
            rows = cur.fetchall()
    finally:
        conn.close()

    return [
        {
            "equipment_id": equipment_id,
            "lat": float(lat) if lat is not None else 39.7392,
            "lon": float(lon) if lon is not None else -104.9903,
            "operator_id": operator_id,
            "fuel": float(fuel_gauge) if fuel_gauge is not None else 80.0,
            "health": float(health) if health is not None else 90.0,
        }
        for equipment_id, lat, lon, operator_id, fuel_gauge, health in rows
    ]


async def _stream_loop(iterations: int, interval_seconds: float) -> None:
    """Async telemetry loop.  Runs until cancelled or iterations exhausted."""
    global _iterations_done
    _iterations_done = 0

    # Fetch active equipment once; re-query could be added if needed.
    equipment = await asyncio.get_event_loop().run_in_executor(None, _fetch_active_equipment)
    if not equipment:
        print("[stream] No active rentals found — run POST /seed first.")
        return

    print(f"[stream] Starting: {len(equipment)} equipment, "
          f"{'∞' if iterations == 0 else iterations} iterations, {interval_seconds}s interval.")

    headers = {"X-Device-Key": DEVICE_API_KEY, "Content-Type": "application/json"}

    async with httpx.AsyncClient(timeout=10.0) as client:
        i = 0
        while iterations == 0 or i < iterations:
            for e in equipment:
                e["lat"] += random.uniform(-JITTER_DEG, JITTER_DEG)
                e["lon"] += random.uniform(-JITTER_DEG, JITTER_DEG)
                status_id = EQUIPMENT_STATUS_IDLE if random.random() < 0.15 else EQUIPMENT_STATUS_ACTIVE
                if status_id == EQUIPMENT_STATUS_ACTIVE:
                    e["fuel"] = max(5.0, e["fuel"] - random.uniform(0.3, 1.2))
                    e["health"] = max(10.0, e["health"] - random.uniform(0.01, 0.05))
                if e["fuel"] < 15 and random.random() < 0.3:
                    e["fuel"] = round(random.uniform(90, 100), 2)

                payload = {
                    "equipmentId": e["equipment_id"],
                    "latitude": round(e["lat"], 7),
                    "longitude": round(e["lon"], 7),
                    "operatorId": e["operator_id"],
                    "statusId": status_id,
                    "fuelGauge": round(e["fuel"], 2),
                    "health": round(e["health"], 2),
                }
                try:
                    resp = await client.post(f"{API_BASE_URL}/api/telemetry", json=payload, headers=headers)
                    if resp.status_code >= 300:
                        print(f"  [stream] equipment {e['equipment_id']}: "
                              f"HTTP {resp.status_code} {resp.text[:120]}")
                except httpx.ConnectError:
                    print(f"[stream] Cannot reach backend at {API_BASE_URL} — retrying next iteration.")

            _iterations_done = i + 1
            print(f"[stream] iteration {_iterations_done} — posted telemetry for {len(equipment)} equipment")
            await asyncio.sleep(interval_seconds)
            i += 1

    print("[stream] Finished.")


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.post("/start", status_code=202)
async def start_stream(body: StreamStartRequest):
    """Start the live telemetry simulation in the background.

    - **iterations**: how many rounds to post (0 = infinite, stop with POST /stream/stop)
    - **interval_seconds**: pause between rounds (default 15 s)
    """
    global _task
    if _task is not None and not _task.done():
        raise HTTPException(status_code=409, detail="Streaming is already running. POST /stream/stop first.")

    _task = asyncio.create_task(
        _stream_loop(body.iterations, body.interval_seconds),
        name="telemetry-stream",
    )
    return {
        "message": "Streaming started.",
        "iterations": body.iterations or "∞",
        "interval_seconds": body.interval_seconds,
    }


@router.post("/stop", status_code=200)
async def stop_stream():
    """Cancel the running telemetry stream (no-op if not running)."""
    global _task
    if _task is None or _task.done():
        return {"message": "Stream was not running."}
    _task.cancel()
    try:
        await _task
    except asyncio.CancelledError:
        pass
    _task = None
    return {"message": "Stream stopped.", "iterations_done": _iterations_done}


@router.get("/status", response_model=StreamStatusResponse)
def stream_status():
    """Return whether the telemetry stream is currently active."""
    running = _task is not None and not _task.done()
    return StreamStatusResponse(
        running=running,
        iterations_done=_iterations_done,
        api_base_url=API_BASE_URL,
    )
