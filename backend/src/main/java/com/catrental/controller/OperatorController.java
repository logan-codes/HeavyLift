package com.catrental.controller;

import com.catrental.dto.CreateOperatorRequest;
import com.catrental.dto.OperatorDto;
import com.catrental.service.OperatorService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/operators")
public class OperatorController {

    private final OperatorService operatorService;

    public OperatorController(OperatorService operatorService) {
        this.operatorService = operatorService;
    }

    @GetMapping
    public List<OperatorDto> list() {
        return operatorService.list();
    }

    @PostMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public OperatorDto create(@Valid @RequestBody CreateOperatorRequest request) {
        return operatorService.create(request);
    }
}
