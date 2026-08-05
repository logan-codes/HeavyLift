from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.config import settings
from app.db import get_connection
from app.security import verify_shared_secret

router = APIRouter(prefix="/predict-return", tags=["predict-return"], dependencies=[Depends(verify_shared_secret)])


class PredictReturnResponse(BaseModel):
    rental_id: int
    customer_id: int
    customer_name: str
    due_on: str
    probability_overrun: float
    risk_level: str
    sample_size: int
    based_on: str  # "customer_history" | "global_average"


def _risk_level(probability: float) -> str:
    if probability < 0.3:
        return "low"
    if probability < 0.6:
        return "medium"
    return "high"


@router.get("/{rental_id}", response_model=PredictReturnResponse)
def predict_return(rental_id: int):
    with get_connection() as conn:
        rental = conn.execute(
            """
            SELECT r.rental_id, r.due_on, c.customer_id, c.name AS customer_name
            FROM rentals r JOIN customer c ON r.customer_id = c.customer_id
            WHERE r.rental_id = %s
            """,
            (rental_id,),
        ).fetchone()
        if not rental:
            raise HTTPException(status_code=404, detail=f"No rental with id {rental_id}")

        customer_history = conn.execute(
            """
            SELECT due_on, edited_on
            FROM rentals
            WHERE customer_id = %s AND status_id = %s
            """,
            (rental["customer_id"], settings.status_rental_completed),
        ).fetchall()

        based_on = "customer_history"
        history = customer_history
        if not history:
            based_on = "global_average"
            history = conn.execute(
                "SELECT due_on, edited_on FROM rentals WHERE status_id = %s",
                (settings.status_rental_completed,),
            ).fetchall()

    total = len(history)
    late = sum(1 for h in history if h["edited_on"].date() > h["due_on"])

    # Laplace smoothing avoids a hard 0% or 100% from a tiny sample.
    probability = (late + 1) / (total + 2) if total > 0 else 0.5

    return PredictReturnResponse(
        rental_id=rental["rental_id"],
        customer_id=rental["customer_id"],
        customer_name=rental["customer_name"],
        due_on=rental["due_on"].isoformat(),
        probability_overrun=round(probability, 3),
        risk_level=_risk_level(probability),
        sample_size=total,
        based_on=based_on,
    )
