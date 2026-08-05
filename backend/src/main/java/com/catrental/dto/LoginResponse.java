package com.catrental.dto;

public record LoginResponse(
        String token,
        Integer userId,
        String username,
        String firstName,
        String lastName,
        String role
) {
}
