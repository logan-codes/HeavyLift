package com.catrental.controller;

import com.catrental.dto.AlertDto;
import com.catrental.dto.AlertStatusUpdateRequest;
import com.catrental.dto.AlertSummaryDto;
import com.catrental.service.AlertService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class AlertController {

    private final AlertService alertService;

    public AlertController(AlertService alertService) {
        this.alertService = alertService;
    }

    @GetMapping
    public List<AlertDto> list(@RequestParam(required = false) String alertType,
                                @RequestParam(required = false) Integer statusId,
                                @RequestParam(required = false) Integer siteId,
                                @RequestParam(required = false) Integer equipmentId) {
        return alertService.list(alertType, statusId, siteId, equipmentId);
    }

    @GetMapping("/summary")
    public AlertSummaryDto summary() {
        return alertService.summary();
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'SITE_MANAGER', 'MAINTENANCE_TEAM', 'RENTAL_OPERATOR')")
    public AlertDto updateStatus(@PathVariable("id") Integer id, @Valid @RequestBody AlertStatusUpdateRequest request) {
        return alertService.updateStatus(id, request.statusId());
    }
}
