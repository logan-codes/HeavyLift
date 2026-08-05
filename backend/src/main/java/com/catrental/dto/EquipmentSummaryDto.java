package com.catrental.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record EquipmentSummaryDto(
        Integer equipmentId,
        String name,
        BigDecimal health,
        String fuelType,
        String statusName,
        LocalDate lastMaintenanceOn,
        BigDecimal latitude,
        BigDecimal longitude,
        BigDecimal fuelGauge,
        String operatorName
) {
}
