package com.catrental.dto;

import java.math.BigDecimal;

public record SiteDto(
        Integer siteId,
        String name,
        String address,
        BigDecimal latitude,
        BigDecimal longitude,
        Integer statusId,
        String statusName,
        Boolean isActive
) {
}
