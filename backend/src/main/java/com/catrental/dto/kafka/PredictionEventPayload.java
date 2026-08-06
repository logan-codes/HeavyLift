package com.catrental.dto.kafka;

import java.time.LocalDateTime;

/**
 * Published to {@code predictions.created} by ai-service after it persists a row to the
 * {@code predictions} table; consumed by {@link com.catrental.service.PredictionEventListener}.
 * {@code severity} is one of "normal" | "warning" | "critical" — only warning/critical raise an alert.
 */
public record PredictionEventPayload(
        Integer equipmentId,
        Integer siteId,
        String predictionType,
        Double score,
        String severity,
        String detail,
        String modelVersion,
        LocalDateTime createdAt
) {
}
