package com.catrental.controller;

import com.catrental.config.AppProperties;
import com.catrental.dto.TelemetryEventRequest;
import com.catrental.service.TelemetryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/telemetry")
public class TelemetryController {

    private final TelemetryService telemetryService;
    private final AppProperties appProperties;

    public TelemetryController(TelemetryService telemetryService, AppProperties appProperties) {
        this.telemetryService = telemetryService;
        this.appProperties = appProperties;
    }

    @PostMapping
    public ResponseEntity<Void> ingest(@Valid @RequestBody TelemetryEventRequest event,
                                        @RequestHeader(value = "X-Device-Key", required = false) String deviceKey) {
        if (deviceKey == null || !deviceKey.equals(appProperties.getDevice().getApiKey())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid or missing device key");
        }
        telemetryService.ingest(event);
        return ResponseEntity.accepted().build();
    }
}
