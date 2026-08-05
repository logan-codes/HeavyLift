package com.catrental.dto;

import java.util.List;

public record EquipmentDetailDto(
        EquipmentSummaryDto equipment,
        RentalDto currentRental,
        List<AlertDto> openAlerts,
        List<UsageHistoryPointDto> recentHistory
) {
}
