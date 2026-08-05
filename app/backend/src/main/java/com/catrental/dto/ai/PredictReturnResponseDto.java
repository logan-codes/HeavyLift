package com.catrental.dto.ai;

public record PredictReturnResponseDto(
        Integer rentalId,
        Integer customerId,
        String customerName,
        String dueOn,
        Double probabilityOverrun,
        String riskLevel,
        Integer sampleSize,
        String basedOn
) {
}
