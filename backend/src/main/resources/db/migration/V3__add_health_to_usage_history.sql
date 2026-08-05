-- Flagged deviation from the literal usage_history spec: anomaly detection needs a
-- health time series (health drop is a required anomaly signal) but Equipment.health
-- is a single current value with no history. Add health to the telemetry stream,
-- modeling an onboard condition-score sensor reported alongside fuel/location.
ALTER TABLE usage_history ADD COLUMN health DECIMAL(5,2);
