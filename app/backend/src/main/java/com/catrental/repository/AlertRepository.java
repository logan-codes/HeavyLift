package com.catrental.repository;

import com.catrental.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AlertRepository extends JpaRepository<Alert, Integer> {
    List<Alert> findByEquipment_EquipmentId(Integer equipmentId);

    boolean existsByEquipment_EquipmentIdAndAlertTypeAndStatus_StatusId(
            Integer equipmentId, String alertType, Integer statusId);
}
