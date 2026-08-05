package com.catrental.dto.ai;

public record UtilizationResponseDto(
        Integer equipmentId,
        Integer windowDays,
        Integer sampleCount,
        Double activeHours,
        Double idleHours,
        Double otherHours,
        Double utilizationPct,
        Boolean underUsed
) {
}
