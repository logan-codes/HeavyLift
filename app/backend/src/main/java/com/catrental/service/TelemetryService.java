package com.catrental.service;

import com.catrental.dto.TelemetryEventRequest;
import com.catrental.entity.*;
import com.catrental.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class TelemetryService {

    private final EquipmentRepository equipmentRepository;
    private final OperatorRepository operatorRepository;
    private final StatusRepository statusRepository;
    private final UsageRealtimeRepository usageRealtimeRepository;
    private final UsageHistoryRepository usageHistoryRepository;

    public TelemetryService(EquipmentRepository equipmentRepository,
                             OperatorRepository operatorRepository,
                             StatusRepository statusRepository,
                             UsageRealtimeRepository usageRealtimeRepository,
                             UsageHistoryRepository usageHistoryRepository) {
        this.equipmentRepository = equipmentRepository;
        this.operatorRepository = operatorRepository;
        this.statusRepository = statusRepository;
        this.usageRealtimeRepository = usageRealtimeRepository;
        this.usageHistoryRepository = usageHistoryRepository;
    }

    @Transactional
    public void ingest(TelemetryEventRequest event) {
        Equipment equipment = equipmentRepository.findById(event.equipmentId())
                .orElseThrow(() -> new EntityNotFoundException("No equipment with id " + event.equipmentId()));

        Status status = statusRepository.findById(event.statusId())
                .orElseThrow(() -> new EntityNotFoundException("No status with id " + event.statusId()));

        Operator operator = null;
        if (event.operatorId() != null) {
            operator = operatorRepository.findById(event.operatorId())
                    .orElseThrow(() -> new EntityNotFoundException("No operator with id " + event.operatorId()));
        }

        UsageRealtime realtime = usageRealtimeRepository.findById(event.equipmentId())
                .orElseGet(() -> UsageRealtime.builder().equipmentId(event.equipmentId()).equipment(equipment).build());
        realtime.setLatitude(event.latitude());
        realtime.setLongitude(event.longitude());
        realtime.setOperator(operator);
        realtime.setStatus(status);
        realtime.setFuelGauge(event.fuelGauge());
        usageRealtimeRepository.save(realtime);

        equipment.setLatitude(event.latitude());
        equipment.setLongitude(event.longitude());
        equipment.setStatus(status);
        if (event.health() != null) {
            equipment.setHealth(event.health());
        }
        equipmentRepository.save(equipment);

        UsageHistory history = UsageHistory.builder()
                .equipment(equipment)
                .recordedAt(LocalDateTime.now())
                .latitude(event.latitude())
                .longitude(event.longitude())
                .operator(operator)
                .status(status)
                .fuelGauge(event.fuelGauge())
                .health(event.health())
                .build();
        usageHistoryRepository.save(history);
    }
}
