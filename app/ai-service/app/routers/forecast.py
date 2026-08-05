from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.db import get_connection
from app.security import verify_shared_secret

router = APIRouter(prefix="/forecast", tags=["forecast"], dependencies=[Depends(verify_shared_secret)])

MOVING_AVERAGE_WINDOW_WEEKS = 4


class WeekCount(BaseModel):
    week_start: str
    count: int


class CategoryForecast(BaseModel):
    category: str
    history: list[WeekCount]
    forecast: list[WeekCount]


class ForecastResponse(BaseModel):
    site_id: int | None
    weeks_history: int
    weeks_ahead: int
    categories: list[CategoryForecast]


@router.get("", response_model=ForecastResponse)
def get_forecast(site_id: int | None = None, weeks_ahead: int = 4):
    import pandas as pd

    with get_connection() as conn:
        if site_id is not None:
            rows = conn.execute(
                """
                SELECT r.created_on, e.name
                FROM rentals r JOIN equipment e ON r.equipment_id = e.equipment_id
                WHERE r.site_id = %s
                """,
                (site_id,),
            ).fetchall()
        else:
            rows = conn.execute(
                """
                SELECT r.created_on, e.name
                FROM rentals r JOIN equipment e ON r.equipment_id = e.equipment_id
                """
            ).fetchall()

    if not rows:
        return ForecastResponse(site_id=site_id, weeks_history=0, weeks_ahead=weeks_ahead, categories=[])

    df = pd.DataFrame(rows)
    df["created_on"] = pd.to_datetime(df["created_on"])
    # Convention: equipment names are "<Category> <identifier>" (e.g. "Excavator EXC-014"),
    # so the category is the first word — there's no dedicated equipment-type column in the schema.
    df["category"] = df["name"].str.split().str[0]
    df["week_start"] = df["created_on"].dt.to_period("W-MON").dt.start_time

    categories: list[CategoryForecast] = []
    for category, group in df.groupby("category"):
        weekly = group.groupby("week_start").size().sort_index()
        # Fill any gap weeks with 0 so the moving average isn't skewed by missing weeks.
        full_index = pd.date_range(weekly.index.min(), weekly.index.max(), freq="W-MON")
        weekly = weekly.reindex(full_index, fill_value=0)

        history = [WeekCount(week_start=idx.date().isoformat(), count=int(v)) for idx, v in weekly.items()]

        baseline = weekly.tail(MOVING_AVERAGE_WINDOW_WEEKS).mean()
        baseline = 0 if pd.isna(baseline) else round(baseline)

        last_week = weekly.index.max()
        forecast = [
            WeekCount(week_start=(last_week + pd.Timedelta(weeks=w)).date().isoformat(), count=int(baseline))
            for w in range(1, weeks_ahead + 1)
        ]

        categories.append(CategoryForecast(category=category, history=history, forecast=forecast))

    return ForecastResponse(
        site_id=site_id,
        weeks_history=int(df["week_start"].nunique()),
        weeks_ahead=weeks_ahead,
        categories=sorted(categories, key=lambda c: c.category),
    )
