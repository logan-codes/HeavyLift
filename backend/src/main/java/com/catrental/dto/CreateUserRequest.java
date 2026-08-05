package com.catrental.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateUserRequest(
        @NotBlank String username,
        @NotBlank String password,
        String firstName,
        String lastName,
        String email,
        String phone,
        @NotNull Integer roleId
) {
}
