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
        BigDecimal health
) {
}
