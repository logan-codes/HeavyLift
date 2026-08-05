package com.catrental.dto.ai;

import java.util.List;

public record AnomalyResponseDto(
        Integer equipmentId,
        Integer sampleCount,
        List<AnomalyItemDto> anomalies
) {
    public record AnomalyItemDto(
            String recordedAt,
            String anomalyType,
            String detail,
            String severity
    ) {
    }
}
