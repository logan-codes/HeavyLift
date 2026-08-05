package com.catrental.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record RentalDto(
        Integer rentalId,
        Integer equipmentId,
        String equipmentName,
        Integer customerId,
        String customerName,
        Integer siteId,
        String siteName,
        LocalDate dueOn,
        String rentStatus,
        Integer statusId,
        String statusName,
        Integer rentalDays,
        Boolean isActive,
        LocalDateTime createdOn,
        LocalDateTime editedOn
) {
}
