package com.catrental.dto;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public record CreateSiteRequest(
        @NotBlank String name,
        String address,
        BigDecimal latitude,
        BigDecimal longitude
) {
}
