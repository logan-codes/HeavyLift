package com.catrental.service;

import com.catrental.config.AppProperties;
import com.catrental.dto.TelemetryEventRequest;
import com.catrental.dto.kafka.TelemetryEventPayload;
import com.catrental.entity.*;
import com.catrental.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class TelemetryService {

    private static final Logger log = LoggerFactory.getLogger(TelemetryService.class);

    private final EquipmentRepository equipmentRepository;
    private final OperatorRepository operatorRepository;
    private final StatusRepository statusRepository;
    private final UsageRealtimeRepository usageRealtimeRepository;
    private final UsageHistoryRepository usageHistoryRepository;
    private final KafkaTemplate<Object, Object> kafkaTemplate;
    private final SimpMessagingTemplate messagingTemplate;
    private final AppProperties appProperties;

    public TelemetryService(EquipmentRepository equipmentRepository,
                             OperatorRepository operatorRepository,
                             StatusRepository statusRepository,
                             UsageRealtimeRepository usageRealtimeRepository,
                             UsageHistoryRepository usageHistoryRepository,
                             KafkaTemplate<Object, Object> kafkaTemplate,
                             SimpMessagingTemplate messagingTemplate,
                             AppProperties appProperties) {
        this.equipmentRepository = equipmentRepository;
        this.operatorRepository = operatorRepository;
        this.statusRepository = statusRepository;
        this.usageRealtimeRepository = usageRealtimeRepository;
        this.usageHistoryRepository = usageHistoryRepository;
        this.kafkaTemplate = kafkaTemplate;
        this.messagingTemplate = messagingTemplate;
        this.appProperties = appProperties;
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
        // ML diagnostic telemetry
        realtime.setEngineHours(event.engineHours());
        realtime.setMetric1(event.metric1());
        realtime.setMetric2(event.metric2());
        realtime.setMetric3(event.metric3());
        realtime.setMetric4(event.metric4());
        realtime.setMetric5(event.metric5());
        realtime.setMetric6(event.metric6());
        realtime.setMetric7(event.metric7());
        realtime.setMetric8(event.metric8());
        usageRealtimeRepository.save(realtime);

        equipment.setLatitude(event.latitude());
        equipment.setLongitude(event.longitude());
        equipment.setStatus(status);
        if (event.health() != null) {
            equipment.setHealth(event.health());
        }
        equipmentRepository.save(equipment);

        LocalDateTime recordedAt = LocalDateTime.now();
        UsageHistory history = UsageHistory.builder()
                .equipment(equipment)
                .recordedAt(recordedAt)
                .latitude(event.latitude())
                .longitude(event.longitude())
                .operator(operator)
                .status(status)
                .fuelGauge(event.fuelGauge())
                .health(event.health())
                // ML diagnostic telemetry
                .engineHours(event.engineHours())
                .metric1(event.metric1())
                .metric2(event.metric2())
                .metric3(event.metric3())
                .metric4(event.metric4())
                .metric5(event.metric5())
                .metric6(event.metric6())
                .metric7(event.metric7())
                .metric8(event.metric8())
                .build();
        usageHistoryRepository.save(history);

        TelemetryEventPayload payload = new TelemetryEventPayload(
                event.equipmentId(), recordedAt, event.latitude(), event.longitude(),
                event.operatorId(), event.statusId(), event.fuelGauge(), event.health(),
                event.engineHours(),
                event.metric1(), event.metric2(), event.metric3(), event.metric4(),
                event.metric5(), event.metric6(), event.metric7(), event.metric8());

        try {
            kafkaTemplate.send(appProperties.getKafka().getTopics().getTelemetryRaw(),
                    event.equipmentId().toString(), payload);
        } catch (Exception e) {
            log.warn("Failed to publish telemetry event for equipment {} to Kafka: {}",
                    event.equipmentId(), e.getMessage());
        }

        messagingTemplate.convertAndSend("/topic/equipment", payload);
    }
}
