"""POST /seed — triggers the full seeding pipeline (master data + 6-month history).

Runs inside a ThreadPoolExecutor so the blocking SQL work doesn't freeze the
event loop.  The underlying scripts are idempotent (they check before inserting),
so this endpoint is safe to call multiple times.
"""

import asyncio
from concurrent.futures import ThreadPoolExecutor

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.services import seed_history


router = APIRouter(prefix="/seed", tags=["seed"])

# A single-thread executor keeps concurrent seed calls serialised — running two
# in parallel would cause duplicate-key races in the DB.
_executor = ThreadPoolExecutor(max_workers=1)
_seeding = False


class SeedResponse(BaseModel):
    message: str
    planned_rentals: int | None = None
    active_rentals: int | None = None
    history_rows: int | None = None


@router.post("", response_model=SeedResponse)
async def trigger_seed():
    """Seed master data + ~6 months of rental history, then return a summary.

    Safe to call repeatedly — all inserts are guarded against duplicates.
    Raises 409 if a seed run is already in progress.
    """
    global _seeding
    if _seeding:
        raise HTTPException(status_code=409, detail="A seed run is already in progress.")

    _seeding = True
    try:
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(_executor, seed_history.run)
    finally:
        _seeding = False

    active = result.get("active_rentals", [])
    planned = result.get("planned_rentals", [])
    return SeedResponse(
        message="Seeding completed successfully.",
        planned_rentals=len(planned) if isinstance(planned, list) else None,
        active_rentals=len(active) if isinstance(active, list) else None,
    )
