package com.catrental.service;

import com.catrental.dto.ai.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class AiClientService {

    private static final Logger log = LoggerFactory.getLogger(AiClientService.class);

    private final RestClient aiServiceRestClient;

    public AiClientService(RestClient aiServiceRestClient) {
        this.aiServiceRestClient = aiServiceRestClient;
    }

    public AiResult<UtilizationResponseDto> getUtilization(Integer equipmentId, int days) {
        return call(() -> aiServiceRestClient.get()
                .uri(uriBuilder -> uriBuilder.path("/utilization/{id}").queryParam("days", days).build(equipmentId))
                .retrieve()
                .body(UtilizationResponseDto.class));
    }

    public AiResult<AnomalyResponseDto> getAnomalies(Integer equipmentId, int limit) {
        return call(() -> aiServiceRestClient.get()
                .uri(uriBuilder -> uriBuilder.path("/anomaly-check/{id}").queryParam("limit", limit).build(equipmentId))
                .retrieve()
                .body(AnomalyResponseDto.class));
    }

    public AiResult<ForecastResponseDto> getForecast(Integer siteId, int weeksAhead) {
        return call(() -> aiServiceRestClient.get()
                .uri(uriBuilder -> {
                    uriBuilder.path("/forecast").queryParam("weeks_ahead", weeksAhead);
                    if (siteId != null) {
                        uriBuilder.queryParam("site_id", siteId);
                    }
                    return uriBuilder.build();
                })
                .retrieve()
                .body(ForecastResponseDto.class));
    }

    public AiResult<PredictReturnResponseDto> getPredictReturn(Integer rentalId) {
        return call(() -> aiServiceRestClient.get()
                .uri(uriBuilder -> uriBuilder.path("/predict-return/{id}").build(rentalId))
                .retrieve()
                .body(PredictReturnResponseDto.class));
    }

    public AiResult<MaintenanceRiskResponseDto> getMaintenanceRisk(Integer equipmentId) {
        return call(() -> aiServiceRestClient.get()
                .uri(uriBuilder -> uriBuilder.path("/maintenance-risk/{id}").build(equipmentId))
                .retrieve()
                .body(MaintenanceRiskResponseDto.class));
    }

    private <T> AiResult<T> call(java.util.function.Supplier<T> supplier) {
        try {
            return AiResult.ok(supplier.get());
        } catch (Exception e) {
            log.warn("AI service call failed: {}", e.getMessage());
            return AiResult.unavailable("AI service unavailable: " + e.getMessage());
        }
    }
}
