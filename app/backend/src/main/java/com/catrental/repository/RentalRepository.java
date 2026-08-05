package com.catrental.repository;

import com.catrental.entity.Rental;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RentalRepository extends JpaRepository<Rental, Integer> {
    List<Rental> findBySite_SiteId(Integer siteId);
    List<Rental> findByEquipment_EquipmentIdAndIsActiveTrue(Integer equipmentId);
    List<Rental> findByCustomer_CustomerId(Integer customerId);
}
