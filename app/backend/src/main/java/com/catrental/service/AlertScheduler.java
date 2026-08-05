package com.catrental.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class AlertScheduler {

    private static final Logger log = LoggerFactory.getLogger(AlertScheduler.class);

    private final AlertService alertService;

    public AlertScheduler(AlertService alertService) {
        this.alertService = alertService;
    }

    @Scheduled(fixedRateString = "${app.alerts.check-interval-ms}", initialDelay = 5000)
    public void runChecks() {
        try {
            alertService.runAllChecks();
        } catch (Exception e) {
            log.error("Alert check run failed", e);
        }
    }
}
