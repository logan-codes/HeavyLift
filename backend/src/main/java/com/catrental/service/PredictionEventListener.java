package com.catrental.service;

import com.catrental.dto.kafka.PredictionEventPayload;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * Consumes ai-service's real-time predictions (anomaly / maintenance-risk / utilization /
 * demand-forecast). Warning/critical severities become alerts via the existing dedup logic;
 * every prediction is broadcast to the dashboard regardless of severity.
 */
@Component
public class PredictionEventListener {

    private static final Logger log = LoggerFactory.getLogger(PredictionEventListener.class);

    private final AlertService alertService;
    private final SimpMessagingTemplate messagingTemplate;

    public PredictionEventListener(AlertService alertService, SimpMessagingTemplate messagingTemplate) {
        this.alertService = alertService;
        this.messagingTemplate = messagingTemplate;
    }

    @KafkaListener(topics = "${app.kafka.topics.predictions-created}")
    public void onPrediction(PredictionEventPayload payload) {
        try {
            if (payload.equipmentId() != null
                    && ("warning".equalsIgnoreCase(payload.severity()) || "critical".equalsIgnoreCase(payload.severity()))) {
                String alertType = "predicted_" + payload.predictionType();
                String message = payload.detail() != null ? payload.detail()
                        : payload.predictionType() + " prediction flagged severity " + payload.severity()
                                + " (score " + payload.score() + ")";
                alertService.createOrSkipAlert(payload.equipmentId(), alertType, message);
            }
        } catch (Exception e) {
            log.error("Failed to process prediction event for equipment {}: {}", payload.equipmentId(), e.getMessage(), e);
        }
        messagingTemplate.convertAndSend("/topic/predictions", payload);
    }
}
