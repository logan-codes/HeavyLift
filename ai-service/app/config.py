from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    db_host: str = "localhost"
    db_port: int = 5432
    db_name: str = "cat_rental"
    db_user: str = "cat_rental"
    db_password: str = "cat_rental_dev"

    ai_service_secret: str = "dev-only-ai-secret"

    # Status ids from backend/src/main/resources/db/migration/V2__seed_reference_data.sql
    status_equipment_active: int = 1
    status_equipment_idle: int = 2
    status_rental_completed: int = 6

    # Thresholds
    under_utilized_threshold_pct: float = 40.0
    health_drop_threshold: float = 10.0
    fuel_jump_threshold: float = 20.0
    location_jump_speed_kmh: float = 80.0

    class Config:
        env_prefix = ""


settings = Settings()
