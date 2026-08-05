package com.catrental.service;

import com.catrental.constants.StatusConstants;
import com.catrental.dto.*;
import com.catrental.entity.Equipment;
import com.catrental.entity.UsageHistory;
import com.catrental.entity.UsageRealtime;
import com.catrental.repository.EquipmentRepository;
import com.catrental.repository.UsageHistoryRepository;
import com.catrental.repository.UsageRealtimeRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class EquipmentService {

    private static final int DEFAULT_HISTORY_LIMIT = 50;

    private final EquipmentRepository equipmentRepository;
    private final UsageRealtimeRepository usageRealtimeRepository;
    private final UsageHistoryRepository usageHistoryRepository;
    private final RentalService rentalService;
    private final AlertService alertService;

    public EquipmentService(EquipmentRepository equipmentRepository,
                             UsageRealtimeRepository usageRealtimeRepository,
                             UsageHistoryRepository usageHistoryRepository,
                             RentalService rentalService,
                             AlertService alertService) {
        this.equipmentRepository = equipmentRepository;
        this.usageRealtimeRepository = usageRealtimeRepository;
        this.usageHistoryRepository = usageHistoryRepository;
        this.rentalService = rentalService;
        this.alertService = alertService;
    }

    @Transactional(readOnly = true)
    public List<EquipmentSummaryDto> listAll(Integer statusId, BigDecimal minHealth, BigDecimal maxHealth, Integer siteId) {
        List<Equipment> equipment = equipmentRepository.findAll();

        Map<Integer, UsageRealtime> realtimeByEquipmentId = usageRealtimeRepository.findAll().stream()
                .collect(Collectors.toMap(UsageRealtime::getEquipmentId, Function.identity()));

        java.util.Set<Integer> equipmentIdsAtSite = siteId == null ? null
                : rentalService.list(siteId, null, null, true).stream()
                        .map(RentalDto::equipmentId)
                        .collect(Collectors.toSet());

        return equipment.stream()
                .filter(e -> statusId == null || (e.getStatus() != null && statusId.equals(e.getStatus().getStatusId())))
                .filter(e -> minHealth == null || (e.getHealth() != null && e.getHealth().compareTo(minHealth) >= 0))
                .filter(e -> maxHealth == null || (e.getHealth() != null && e.getHealth().compareTo(maxHealth) <= 0))
                .filter(e -> equipmentIdsAtSite == null || equipmentIdsAtSite.contains(e.getEquipmentId()))
                .map(e -> toDto(e, realtimeByEquipmentId.get(e.getEquipmentId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public EquipmentDetailDto getDetail(Integer equipmentId) {
        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new EntityNotFoundException("No equipment with id " + equipmentId));
        UsageRealtime realtime = usageRealtimeRepository.findById(equipmentId).orElse(null);

        RentalDto currentRental = rentalService.list(null, null, equipmentId, true).stream()
                .findFirst().orElse(null);

        List<AlertDto> openAlerts = alertService.list(null, StatusConstants.ALERT_OPEN, null, equipmentId);

        List<UsageHistoryPointDto> recentHistory = usageHistoryRepository
                .findByEquipment_EquipmentIdOrderByRecordedAtDesc(equipmentId).stream()
                .limit(DEFAULT_HISTORY_LIMIT)
                .sorted((a, b) -> a.getRecordedAt().compareTo(b.getRecordedAt()))
                .map(this::toHistoryPointDto)
                .toList();

        return new EquipmentDetailDto(toDto(equipment, realtime), currentRental, openAlerts, recentHistory);
    }

    private EquipmentSummaryDto toDto(Equipment e, UsageRealtime realtime) {
        return new EquipmentSummaryDto(
                e.getEquipmentId(),
                e.getName(),
                e.getHealth(),
                e.getFuelType(),
                e.getStatus() != null ? e.getStatus().getName() : null,
                e.getLastMaintenanceOn(),
                e.getLatitude(),
                e.getLongitude(),
                realtime != null ? realtime.getFuelGauge() : null,
                realtime != null && realtime.getOperator() != null ? realtime.getOperator().getOperatorName() : null
        );
    }

    private UsageHistoryPointDto toHistoryPointDto(UsageHistory h) {
        return new UsageHistoryPointDto(
                h.getRecordedAt(),
                h.getLatitude(),
                h.getLongitude(),
                h.getStatus() != null ? h.getStatus().getName() : null,
                h.getFuelGauge(),
                h.getHealth(),
                h.getOperator() != null ? h.getOperator().getOperatorName() : null
        );
    }
}
