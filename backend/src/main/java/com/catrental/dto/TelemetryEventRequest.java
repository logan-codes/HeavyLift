package com.catrental.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record TelemetryEventRequest(
        @NotNull Integer equipmentId,
        BigDecimal latitude,
        BigDecimal longitude,
        Integer operatorId,
        @NotNull Integer statusId,
        BigDecimal fuelGauge,
        BigDecimal health,
        // ML diagnostic telemetry — optional; null-safe throughout the pipeline
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
