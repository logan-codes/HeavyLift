package com.catrental.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record UsageHistoryPointDto(
        LocalDateTime recordedAt,
        BigDecimal latitude,
        BigDecimal longitude,
        String statusName,
        BigDecimal fuelGauge,
        BigDecimal health,
        String operatorName
) {
}
