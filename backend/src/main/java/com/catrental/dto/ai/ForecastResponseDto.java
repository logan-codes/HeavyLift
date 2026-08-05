package com.catrental.dto.ai;

import java.util.List;

public record ForecastResponseDto(
        Integer siteId,
        Integer weeksHistory,
        Integer weeksAhead,
        List<CategoryForecastDto> categories
) {
    public record CategoryForecastDto(
            String category,
            List<WeekCountDto> history,
            List<WeekCountDto> forecast
    ) {
    }

    public record WeekCountDto(
            String weekStart,
            Integer count
    ) {
    }
}
