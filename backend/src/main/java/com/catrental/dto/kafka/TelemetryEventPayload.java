package com.catrental.dto.kafka;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/** Published to {@code telemetry.raw} after a telemetry event is persisted; consumed by ai-service. */
public record TelemetryEventPayload(
        Integer equipmentId,
        LocalDateTime recordedAt,
        BigDecimal latitude,
        BigDecimal longitude,
        Integer operatorId,
        Integer statusId,
        BigDecimal fuelGauge,
        BigDecimal health
) {
}
