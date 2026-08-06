package com.catrental.controller;

import com.catrental.dto.ai.*;
import com.catrental.service.AiClientService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiClientService aiClientService;

    public AiController(AiClientService aiClientService) {
        this.aiClientService = aiClientService;
    }

    @GetMapping("/utilization/{equipmentId}")
    public AiResult<UtilizationResponseDto> utilization(@PathVariable Integer equipmentId,
                                                          @RequestParam(defaultValue = "30") int days) {
        return aiClientService.getUtilization(equipmentId, days);
    }

    @GetMapping("/anomalies/{equipmentId}")
    public AiResult<AnomalyResponseDto> anomalies(@PathVariable Integer equipmentId,
                                                   @RequestParam(defaultValue = "50") int limit) {
        return aiClientService.getAnomalies(equipmentId, limit);
    }

    @GetMapping("/forecast")
    public AiResult<ForecastResponseDto> forecast(@RequestParam(required = false) Integer siteId,
                                                    @RequestParam(defaultValue = "4") int weeksAhead) {
        return aiClientService.getForecast(siteId, weeksAhead);
    }

    @GetMapping("/predict-return/{rentalId}")
    public AiResult<PredictReturnResponseDto> predictReturn(@PathVariable Integer rentalId) {
        return aiClientService.getPredictReturn(rentalId);
    }

    @GetMapping("/maintenance-risk/{equipmentId}")
    public AiResult<MaintenanceRiskResponseDto> maintenanceRisk(@PathVariable Integer equipmentId) {
        return aiClientService.getMaintenanceRisk(equipmentId);
    }
}
