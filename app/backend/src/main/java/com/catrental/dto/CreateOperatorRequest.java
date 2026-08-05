package com.catrental.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public record CreateOperatorRequest(
        @NotBlank String operatorName,
        String phone,
        String licenseNumber,
        LocalDate licenseValidity
) {
}
