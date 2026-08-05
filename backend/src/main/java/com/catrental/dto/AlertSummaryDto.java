package com.catrental.dto;

import java.util.Map;

public record AlertSummaryDto(
        long totalOpen,
        Map<String, Long> openByType
) {
}
