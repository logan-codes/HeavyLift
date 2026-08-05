package com.catrental.controller;

import com.catrental.dto.CreateCustomerRequest;
import com.catrental.dto.CustomerDto;
import com.catrental.service.CustomerService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping
    public List<CustomerDto> list() {
        return customerService.list();
    }

    @PostMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public CustomerDto create(@Valid @RequestBody CreateCustomerRequest request) {
        return customerService.create(request);
    }
}
