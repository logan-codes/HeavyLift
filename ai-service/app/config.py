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

    # Kafka streaming
    kafka_bootstrap_servers: str = "localhost:9092"
    kafka_topic_telemetry_raw: str = "telemetry.raw"
    kafka_topic_predictions_created: str = "predictions.created"

    # Maintenance risk heuristic (see app/ml/maintenance.py)
    maintenance_health_trend_window: int = 20
    maintenance_interval_days: int = 90
    maintenance_trend_full_risk_per_day: float = 0.3
    maintenance_volatility_full_risk: float = 5.0

    class Config:
        env_prefix = ""


settings = Settings()
