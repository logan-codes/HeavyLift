-- Persisted output of the ai-service Kafka consumer pipeline (feature engineering +
-- anomaly/maintenance-risk/utilization/demand-forecast). Written directly by
-- ai-service (same DB role as the backend), read by the backend's PredictionEventListener
-- to decide alert-worthiness and broadcast live updates.
CREATE TABLE predictions (
    prediction_id   BIGSERIAL PRIMARY KEY,
    equipment_id    INT REFERENCES equipment(equipment_id),
    site_id         INT REFERENCES site(site_id),
    prediction_type VARCHAR(50) NOT NULL,
    score           DECIMAL(6,4),
    severity        VARCHAR(20),
    detail          JSONB,
    model_version   VARCHAR(50),
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);
CREATE INDEX idx_predictions_equipment ON predictions(equipment_id, prediction_type, created_at);
