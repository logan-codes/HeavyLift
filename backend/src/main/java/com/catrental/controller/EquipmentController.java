package com.catrental.controller;

import com.catrental.dto.EquipmentDetailDto;
import com.catrental.dto.EquipmentSummaryDto;
import com.catrental.service.EquipmentService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/equipment")
public class EquipmentController {

    private final EquipmentService equipmentService;

    public EquipmentController(EquipmentService equipmentService) {
        this.equipmentService = equipmentService;
    }

    @GetMapping
    public List<EquipmentSummaryDto> list(@RequestParam(required = false) Integer statusId,
                                           @RequestParam(required = false) BigDecimal minHealth,
                                           @RequestParam(required = false) BigDecimal maxHealth,
                                           @RequestParam(required = false) Integer siteId) {
        return equipmentService.listAll(statusId, minHealth, maxHealth, siteId);
    }

    @GetMapping("/{id}")
    public EquipmentDetailDto detail(@PathVariable("id") Integer id) {
        return equipmentService.getDetail(id);
    }
}
