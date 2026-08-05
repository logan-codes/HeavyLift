package com.catrental.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public record CheckOutRequest(
        @NotNull Integer equipmentId, // manually entered equipment code (simulated QR/RFID scan)
        @NotNull Integer customerId,
        @NotNull Integer siteId,
        @NotNull LocalDate dueOn,
        @Min(1) Integer rentalDays
) {
}
