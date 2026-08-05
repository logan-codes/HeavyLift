package com.catrental.dto;

import java.time.LocalDateTime;

public record AlertDto(
        Integer alertId,
        Integer equipmentId,
        String equipmentName,
        Integer rentalId,
        Integer siteId,
        String siteName,
        String alertType,
        Integer statusId,
        String statusName,
        String message,
        Boolean isActive,
        LocalDateTime createdOn,
        LocalDateTime editedOn
) {
}
