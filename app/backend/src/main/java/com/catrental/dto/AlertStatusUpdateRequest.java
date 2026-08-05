package com.catrental.dto;

import jakarta.validation.constraints.NotNull;

public record AlertStatusUpdateRequest(
        @NotNull Integer statusId
) {
}
