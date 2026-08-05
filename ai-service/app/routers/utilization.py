from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.config import settings
from app.db import get_connection
from app.security import verify_shared_secret

router = APIRouter(prefix="/utilization", tags=["utilization"], dependencies=[Depends(verify_shared_secret)])


class UtilizationResponse(BaseModel):
    equipment_id: int
    window_days: int
    sample_count: int
    active_hours: float
    idle_hours: float
    other_hours: float
    utilization_pct: float | None
    under_used: bool | None


@router.get("/{equipment_id}", response_model=UtilizationResponse)
def get_utilization(equipment_id: int, days: int = 30):
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)

    with get_connection() as conn:
        exists = conn.execute("SELECT 1 FROM equipment WHERE equipment_id = %s", (equipment_id,)).fetchone()
        if not exists:
            raise HTTPException(status_code=404, detail=f"No equipment with id {equipment_id}")

        rows = conn.execute(
            """
            SELECT uh.recorded_at, s.name AS status_name
            FROM usage_history uh
            JOIN status s ON s.status_id = uh.status_id
            WHERE uh.equipment_id = %s AND uh.recorded_at >= %s
            ORDER BY uh.recorded_at ASC
            """,
            (equipment_id, cutoff),
        ).fetchall()

    if len(rows) < 2:
        return UtilizationResponse(
            equipment_id=equipment_id, window_days=days, sample_count=len(rows),
            active_hours=0.0, idle_hours=0.0, other_hours=0.0,
            utilization_pct=None, under_used=None,
        )

    active_seconds = idle_seconds = other_seconds = 0.0
    for i in range(len(rows) - 1):
        duration = (rows[i + 1]["recorded_at"] - rows[i]["recorded_at"]).total_seconds()
        if duration <= 0:
            continue
        status_name = rows[i]["status_name"]
        if status_name == "Active":
            active_seconds += duration
        elif status_name == "Idle":
            idle_seconds += duration
        else:
            other_seconds += duration

    total_seconds = active_seconds + idle_seconds + other_seconds
    utilization_pct = round(active_seconds / total_seconds * 100, 1) if total_seconds > 0 else None

    return UtilizationResponse(
        equipment_id=equipment_id,
        window_days=days,
        sample_count=len(rows),
        active_hours=round(active_seconds / 3600, 1),
        idle_hours=round(idle_seconds / 3600, 1),
        other_hours=round(other_seconds / 3600, 1),
        utilization_pct=utilization_pct,
        under_used=(utilization_pct is not None and utilization_pct < settings.under_utilized_threshold_pct),
    )
