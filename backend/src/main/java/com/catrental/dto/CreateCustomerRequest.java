package com.catrental.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateCustomerRequest(
        @NotBlank String name,
        String contactPerson,
        String phone,
        String email,
        String address
) {
}
