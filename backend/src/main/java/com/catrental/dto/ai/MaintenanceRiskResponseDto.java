package com.catrental.dto.ai;

public record MaintenanceRiskResponseDto(
        Integer equipmentId,
        Double riskScore,
        String riskLevel,
        Double healthTrendPerDay,
        Integer daysSinceMaintenance,
        Integer anomalyCountRecent,
        String basedOn,
        String modelVersion
) {
}
