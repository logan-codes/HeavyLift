package com.catrental.service;

import com.catrental.constants.StatusConstants;
import com.catrental.dto.CheckOutRequest;
import com.catrental.dto.RentalDto;
import com.catrental.entity.*;
import com.catrental.repository.*;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class RentalService {

    private final RentalRepository rentalRepository;
    private final EquipmentRepository equipmentRepository;
    private final CustomerRepository customerRepository;
    private final SiteRepository siteRepository;
    private final StatusRepository statusRepository;
    private final UsageRealtimeRepository usageRealtimeRepository;

    public RentalService(RentalRepository rentalRepository,
                          EquipmentRepository equipmentRepository,
                          CustomerRepository customerRepository,
                          SiteRepository siteRepository,
                          StatusRepository statusRepository,
                          UsageRealtimeRepository usageRealtimeRepository) {
        this.rentalRepository = rentalRepository;
        this.equipmentRepository = equipmentRepository;
        this.customerRepository = customerRepository;
        this.siteRepository = siteRepository;
        this.statusRepository = statusRepository;
        this.usageRealtimeRepository = usageRealtimeRepository;
    }

    @Transactional
    public RentalDto checkOut(CheckOutRequest request) {
        Equipment equipment = equipmentRepository.findById(request.equipmentId())
                .orElseThrow(() -> new EntityNotFoundException("No equipment with code " + request.equipmentId()));

        if (!rentalRepository.findByEquipment_EquipmentIdAndIsActiveTrue(equipment.getEquipmentId()).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Equipment " + equipment.getName() + " is already checked out on an active rental");
        }

        Customer customer = customerRepository.findById(request.customerId())
                .orElseThrow(() -> new EntityNotFoundException("No customer with id " + request.customerId()));
        Site site = siteRepository.findById(request.siteId())
                .orElseThrow(() -> new EntityNotFoundException("No site with id " + request.siteId()));
        Status rentalActiveStatus = statusRepository.findById(StatusConstants.RENTAL_ACTIVE)
                .orElseThrow(() -> new EntityNotFoundException("Rental active status not seeded"));
        Status equipmentActiveStatus = statusRepository.findById(StatusConstants.EQUIPMENT_ACTIVE)
                .orElseThrow(() -> new EntityNotFoundException("Equipment active status not seeded"));

        LocalDateTime now = LocalDateTime.now();
        Rental rental = Rental.builder()
                .customer(customer)
                .site(site)
                .equipment(equipment)
                .dueOn(request.dueOn())
                .rentStatus("Active")
                .status(rentalActiveStatus)
                .rentalDays(request.rentalDays())
                .isActive(true)
                .createdOn(now)
                .editedOn(now)
                .build();
        rental = rentalRepository.save(rental);

        equipment.setStatus(equipmentActiveStatus);
        equipmentRepository.save(equipment);

        UsageRealtime realtime = usageRealtimeRepository.findById(equipment.getEquipmentId())
                .orElseGet(() -> UsageRealtime.builder().equipmentId(equipment.getEquipmentId()).equipment(equipment).build());
        realtime.setStatus(equipmentActiveStatus);
        realtime.setLatitude(site.getLatitude());
        realtime.setLongitude(site.getLongitude());
        if (realtime.getFuelGauge() == null) {
            realtime.setFuelGauge(new BigDecimal("100.00"));
        }
        usageRealtimeRepository.save(realtime);

        return toDto(rental);
    }

    @Transactional
    public RentalDto checkIn(Integer rentalId) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new EntityNotFoundException("No rental with id " + rentalId));

        if (!Boolean.TRUE.equals(rental.getIsActive())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Rental " + rentalId + " is already completed");
        }

        Status rentalCompletedStatus = statusRepository.findById(StatusConstants.RENTAL_COMPLETED)
                .orElseThrow(() -> new EntityNotFoundException("Rental completed status not seeded"));
        Status equipmentIdleStatus = statusRepository.findById(StatusConstants.EQUIPMENT_IDLE)
                .orElseThrow(() -> new EntityNotFoundException("Equipment idle status not seeded"));

        rental.setStatus(rentalCompletedStatus);
        rental.setRentStatus("Completed");
        rental.setIsActive(false);
        rental.setEditedOn(LocalDateTime.now());
        rentalRepository.save(rental);

        Equipment equipment = rental.getEquipment();
        equipment.setStatus(equipmentIdleStatus);
        equipmentRepository.save(equipment);

        usageRealtimeRepository.findById(equipment.getEquipmentId()).ifPresent(realtime -> {
            realtime.setStatus(equipmentIdleStatus);
            realtime.setOperator(null);
            usageRealtimeRepository.save(realtime);
        });

        return toDto(rental);
    }

    @Transactional(readOnly = true)
    public List<RentalDto> list(Integer siteId, Integer customerId, Integer equipmentId, Boolean active) {
        return rentalRepository.findAll().stream()
                .filter(r -> siteId == null || (r.getSite() != null && siteId.equals(r.getSite().getSiteId())))
                .filter(r -> customerId == null || (r.getCustomer() != null && customerId.equals(r.getCustomer().getCustomerId())))
                .filter(r -> equipmentId == null || (r.getEquipment() != null && equipmentId.equals(r.getEquipment().getEquipmentId())))
                .filter(r -> active == null || active.equals(r.getIsActive()))
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public RentalDto get(Integer rentalId) {
        return rentalRepository.findById(rentalId)
                .map(this::toDto)
                .orElseThrow(() -> new EntityNotFoundException("No rental with id " + rentalId));
    }

    public RentalDto toDto(Rental r) {
        return new RentalDto(
                r.getRentalId(),
                r.getEquipment() != null ? r.getEquipment().getEquipmentId() : null,
                r.getEquipment() != null ? r.getEquipment().getName() : null,
                r.getCustomer() != null ? r.getCustomer().getCustomerId() : null,
                r.getCustomer() != null ? r.getCustomer().getName() : null,
                r.getSite() != null ? r.getSite().getSiteId() : null,
                r.getSite() != null ? r.getSite().getName() : null,
                r.getDueOn(),
                r.getRentStatus(),
                r.getStatus() != null ? r.getStatus().getStatusId() : null,
                r.getStatus() != null ? r.getStatus().getName() : null,
                r.getRentalDays(),
                r.getIsActive(),
                r.getCreatedOn(),
                r.getEditedOn()
        );
    }
}
