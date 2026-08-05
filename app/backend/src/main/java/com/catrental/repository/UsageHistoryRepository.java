package com.catrental.repository;

import com.catrental.entity.UsageHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UsageHistoryRepository extends JpaRepository<UsageHistory, Long> {
    List<UsageHistory> findByEquipment_EquipmentIdOrderByRecordedAtDesc(Integer equipmentId);
}
