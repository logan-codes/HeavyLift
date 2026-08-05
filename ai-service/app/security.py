from fastapi import Header, HTTPException, status

from app.config import settings


def verify_shared_secret(x_ai_service_secret: str | None = Header(default=None)) -> None:
    if x_ai_service_secret != settings.ai_service_secret:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing AI service secret")
