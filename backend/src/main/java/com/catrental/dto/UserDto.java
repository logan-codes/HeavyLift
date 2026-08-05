package com.catrental.dto;

public record UserDto(
        Integer userId,
        String username,
        String firstName,
        String lastName,
        String email,
        String phone,
        String roleName,
        String statusName,
        Boolean isActive
) {
}
