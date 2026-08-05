package com.catrental.dto;

public record CustomerDto(
        Integer customerId,
        String name,
        String contactPerson,
        String phone,
        String email,
        String address,
        Boolean isActive
) {
}
