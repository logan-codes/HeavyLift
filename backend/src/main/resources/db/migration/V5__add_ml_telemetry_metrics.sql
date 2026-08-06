-- V5: Add 8 ML diagnostic metrics + engine_hours to usage_history and usage_realtime.
-- These columns carry per-reading sensor values from the IoT telemetry stream.
-- Null-safe: all columns are nullable so existing rows and old clients are unaffected.

ALTER TABLE usage_history
    ADD COLUMN engine_hours  DECIMAL(10,2),
    ADD COLUMN metric_1      DECIMAL(10,4),
    ADD COLUMN metric_2      DECIMAL(10,4),
    ADD COLUMN metric_3      DECIMAL(10,4),
    ADD COLUMN metric_4      DECIMAL(10,4),
    ADD COLUMN metric_5      DECIMAL(10,4),
    ADD COLUMN metric_6      DECIMAL(10,4),
    ADD COLUMN metric_7      DECIMAL(10,4),
    ADD COLUMN metric_8      DECIMAL(10,4);

ALTER TABLE usage_realtime
    ADD COLUMN engine_hours  DECIMAL(10,2),
    ADD COLUMN metric_1      DECIMAL(10,4),
    ADD COLUMN metric_2      DECIMAL(10,4),
    ADD COLUMN metric_3      DECIMAL(10,4),
    ADD COLUMN metric_4      DECIMAL(10,4),
    ADD COLUMN metric_5      DECIMAL(10,4),
    ADD COLUMN metric_6      DECIMAL(10,4),
    ADD COLUMN metric_7      DECIMAL(10,4),
    ADD COLUMN metric_8      DECIMAL(10,4);
