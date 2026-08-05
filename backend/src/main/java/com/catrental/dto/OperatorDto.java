package com.catrental.dto;

import java.time.LocalDate;

public record OperatorDto(
        Integer operatorId,
        String operatorName,
        String phone,
        String licenseNumber,
        LocalDate licenseValidity,
        Boolean isActive
) {
}
