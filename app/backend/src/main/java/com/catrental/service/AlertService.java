package com.catrental.service;

import com.catrental.config.AppProperties;
import com.catrental.constants.StatusConstants;
import com.catrental.dto.AlertDto;
import com.catrental.dto.AlertSummaryDto;
import com.catrental.entity.*;
import com.catrental.repository.*;
import com.catrental.util.GeoUtils;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AlertService {

    public static final String TYPE_OVERDUE = "overdue";
    public static final String TYPE_HEALTH = "health";
    public static final String TYPE_MAINTENANCE_DUE = "maintenance_due";
    public static final String TYPE_GEOFENCE = "geofence";
    public static final String TYPE_NO_OPERATOR = "no_operator";

    private final AlertRepository alertRepository;
    private final RentalRepository rentalRepository;
    private final EquipmentRepository equipmentRepository;
    private final UsageRealtimeRepository usageRealtimeRepository;
    private final StatusRepository statusRepository;
    private final AppProperties appProperties;

    public AlertService(AlertRepository alertRepository,
                         RentalRepository rentalRepository,
                         EquipmentRepository equipmentRepository,
                         UsageRealtimeRepository usageRealtimeRepository,
                         StatusRepository statusRepository,
                         AppProperties appProperties) {
        this.alertRepository = alertRepository;
        this.rentalRepository = rentalRepository;
        this.equipmentRepository = equipmentRepository;
        this.usageRealtimeRepository = usageRealtimeRepository;
        this.statusRepository = statusRepository;
        this.appProperties = appProperties;
    }

    @Transactional
    public void runAllChecks() {
        checkOverdueRentals();
        checkHealthAndMaintenance();
        checkGeofence();
        checkNoOperator();
    }

    private void checkOverdueRentals() {
        Status openStatus = requireStatus(StatusConstants.ALERT_OPEN);
        Status rentalOverdueStatus = requireStatus(StatusConstants.RENTAL_OVERDUE);
        LocalDate today = LocalDate.now();

        List<Rental> activeRentals = rentalRepository.findAll().stream()
                .filter(r -> Boolean.TRUE.equals(r.getIsActive()))
                .filter(r -> r.getDueOn() != null && r.getDueOn().isBefore(today))
                .toList();

        for (Rental rental : activeRentals) {
            Integer equipmentId = rental.getEquipment().getEquipmentId();
            if (!alertRepository.existsByEquipment_EquipmentIdAndAlertTypeAndStatus_StatusId(
                    equipmentId, TYPE_OVERDUE, StatusConstants.ALERT_OPEN)) {
                createAlert(rental.getEquipment(), rental, TYPE_OVERDUE, openStatus,
                        "Rental #" + rental.getRentalId() + " for " + rental.getEquipment().getName()
                                + " was due on " + rental.getDueOn() + " and has not been returned.");
            }
            if (rental.getStatus() != null
                    && rental.getStatus().getStatusId().equals(StatusConstants.RENTAL_ACTIVE)) {
                rental.setStatus(rentalOverdueStatus);
                rental.setRentStatus("Overdue");
                rental.setEditedOn(LocalDateTime.now());
                rentalRepository.save(rental);
            }
        }
    }

    private void checkHealthAndMaintenance() {
        Status openStatus = requireStatus(StatusConstants.ALERT_OPEN);
        double healthThreshold = appProperties.getAlerts().getHealthThreshold();
        LocalDate maintenanceCutoff = LocalDate.now().minusDays(appProperties.getAlerts().getMaintenanceIntervalDays());

        for (Equipment equipment : equipmentRepository.findAll()) {
            if (equipment.getHealth() != null
                    && equipment.getHealth().compareTo(BigDecimal.valueOf(healthThreshold)) < 0
                    && !alertRepository.existsByEquipment_EquipmentIdAndAlertTypeAndStatus_StatusId(
                            equipment.getEquipmentId(), TYPE_HEALTH, StatusConstants.ALERT_OPEN)) {
                createAlert(equipment, null, TYPE_HEALTH, openStatus,
                        equipment.getName() + " health score (" + equipment.getHealth() + ") is below the "
                                + healthThreshold + " threshold.");
            }

            if (equipment.getLastMaintenanceOn() != null
                    && equipment.getLastMaintenanceOn().isBefore(maintenanceCutoff)
                    && !alertRepository.existsByEquipment_EquipmentIdAndAlertTypeAndStatus_StatusId(
                            equipment.getEquipmentId(), TYPE_MAINTENANCE_DUE, StatusConstants.ALERT_OPEN)) {
                createAlert(equipment, null, TYPE_MAINTENANCE_DUE, openStatus,
                        equipment.getName() + " last maintained on " + equipment.getLastMaintenanceOn()
                                + ", exceeding the " + appProperties.getAlerts().getMaintenanceIntervalDays()
                                + "-day service interval.");
            }
        }
    }

    private void checkGeofence() {
        Status openStatus = requireStatus(StatusConstants.ALERT_OPEN);
        double radiusKm = appProperties.getGeofence().getRadiusKm();

        List<Rental> activeRentals = rentalRepository.findAll().stream()
                .filter(r -> Boolean.TRUE.equals(r.getIsActive()))
                .filter(r -> r.getSite() != null && r.getEquipment() != null)
                .toList();

        for (Rental rental : activeRentals) {
            usageRealtimeRepository.findById(rental.getEquipment().getEquipmentId()).ifPresent(realtime -> {
                double distanceKm = GeoUtils.haversineKm(
                        rental.getSite().getLatitude(), rental.getSite().getLongitude(),
                        realtime.getLatitude(), realtime.getLongitude());

                if (distanceKm > radiusKm
                        && !alertRepository.existsByEquipment_EquipmentIdAndAlertTypeAndStatus_StatusId(
                                rental.getEquipment().getEquipmentId(), TYPE_GEOFENCE, StatusConstants.ALERT_OPEN)) {
                    createAlert(rental.getEquipment(), rental, TYPE_GEOFENCE, openStatus,
                            rental.getEquipment().getName() + " is " + String.format("%.1f", distanceKm)
                                    + " km from " + rental.getSite().getName() + ", outside the "
                                    + radiusKm + " km contracted radius.");
                }
            });
        }
    }

    private void checkNoOperator() {
        Status openStatus = requireStatus(StatusConstants.ALERT_OPEN);

        List<Rental> activeRentals = rentalRepository.findAll().stream()
                .filter(r -> Boolean.TRUE.equals(r.getIsActive()))
                .toList();

        for (Rental rental : activeRentals) {
            Integer equipmentId = rental.getEquipment().getEquipmentId();
            UsageRealtime realtime = usageRealtimeRepository.findById(equipmentId).orElse(null);
            if (realtime != null && realtime.getOperator() == null
                    && !alertRepository.existsByEquipment_EquipmentIdAndAlertTypeAndStatus_StatusId(
                            equipmentId, TYPE_NO_OPERATOR, StatusConstants.ALERT_OPEN)) {
                createAlert(rental.getEquipment(), rental, TYPE_NO_OPERATOR, openStatus,
                        rental.getEquipment().getName() + " is checked out with no operator assigned.");
            }
        }
    }

    private void createAlert(Equipment equipment, Rental rental, String alertType, Status status, String message) {
        LocalDateTime now = LocalDateTime.now();
        Alert alert = Alert.builder()
                .equipment(equipment)
                .rental(rental)
                .alertType(alertType)
                .status(status)
                .message(message)
                .isActive(true)
                .createdOn(now)
                .editedOn(now)
                .build();
        alertRepository.save(alert);
    }

    private Status requireStatus(int statusId) {
        return statusRepository.findById(statusId)
                .orElseThrow(() -> new EntityNotFoundException("Status " + statusId + " not seeded"));
    }

    public List<AlertDto> list(String alertType, Integer statusId, Integer siteId, Integer equipmentId) {
        return alertRepository.findAll().stream()
                .filter(a -> alertType == null || alertType.equals(a.getAlertType()))
                .filter(a -> statusId == null || (a.getStatus() != null && statusId.equals(a.getStatus().getStatusId())))
                .filter(a -> equipmentId == null || (a.getEquipment() != null && equipmentId.equals(a.getEquipment().getEquipmentId())))
                .filter(a -> siteId == null || (a.getRental() != null && a.getRental().getSite() != null
                        && siteId.equals(a.getRental().getSite().getSiteId())))
                .sorted((a, b) -> b.getCreatedOn().compareTo(a.getCreatedOn()))
                .map(this::toDto)
                .toList();
    }

    public AlertSummaryDto summary() {
        List<Alert> open = alertRepository.findAll().stream()
                .filter(a -> a.getStatus() != null && StatusConstants.ALERT_OPEN == a.getStatus().getStatusId())
                .toList();

        Map<String, Long> byType = open.stream()
                .collect(Collectors.groupingBy(Alert::getAlertType, Collectors.counting()));

        return new AlertSummaryDto(open.size(), byType);
    }

    @Transactional
    public AlertDto updateStatus(Integer alertId, Integer newStatusId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new EntityNotFoundException("No alert with id " + alertId));
        Status status = requireStatus(newStatusId);
        alert.setStatus(status);
        alert.setEditedOn(LocalDateTime.now());
        if (newStatusId == StatusConstants.ALERT_RESOLVED) {
            alert.setIsActive(false);
        }
        alertRepository.save(alert);
        return toDto(alert);
    }

    private AlertDto toDto(Alert a) {
        Site site = a.getRental() != null ? a.getRental().getSite() : null;
        return new AlertDto(
                a.getAlertId(),
                a.getEquipment() != null ? a.getEquipment().getEquipmentId() : null,
                a.getEquipment() != null ? a.getEquipment().getName() : null,
                a.getRental() != null ? a.getRental().getRentalId() : null,
                site != null ? site.getSiteId() : null,
                site != null ? site.getName() : null,
                a.getAlertType(),
                a.getStatus() != null ? a.getStatus().getStatusId() : null,
                a.getStatus() != null ? a.getStatus().getName() : null,
                a.getMessage(),
                a.getIsActive(),
                a.getCreatedOn(),
                a.getEditedOn()
        );
    }
}
