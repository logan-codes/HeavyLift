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
        BigDecimal health,
        // ML diagnostic telemetry — null when not reported by the device
        BigDecimal engineHours,
        BigDecimal metric1,
        BigDecimal metric2,
        BigDecimal metric3,
        BigDecimal metric4,
        BigDecimal metric5,
        BigDecimal metric6,
        BigDecimal metric7,
        BigDecimal metric8
) {
}
