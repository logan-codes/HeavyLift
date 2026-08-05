package com.catrental.controller;

import com.catrental.dto.CheckOutRequest;
import com.catrental.dto.RentalDto;
import com.catrental.service.RentalService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rentals")
public class RentalController {

    private final RentalService rentalService;

    public RentalController(RentalService rentalService) {
        this.rentalService = rentalService;
    }

    @GetMapping
    public List<RentalDto> list(@RequestParam(required = false) Integer siteId,
                                 @RequestParam(required = false) Integer customerId,
                                 @RequestParam(required = false) Integer equipmentId,
                                 @RequestParam(required = false) Boolean active) {
        return rentalService.list(siteId, customerId, equipmentId, active);
    }

    @GetMapping("/{id}")
    public RentalDto get(@PathVariable("id") Integer id) {
        return rentalService.get(id);
    }

    @PostMapping("/check-out")
    @PreAuthorize("hasAnyRole('RENTAL_OPERATOR', 'SYSTEM_ADMIN')")
    public RentalDto checkOut(@Valid @RequestBody CheckOutRequest request) {
        return rentalService.checkOut(request);
    }

    @PostMapping("/{id}/check-in")
    @PreAuthorize("hasAnyRole('RENTAL_OPERATOR', 'SYSTEM_ADMIN')")
    public RentalDto checkIn(@PathVariable("id") Integer id) {
        return rentalService.checkIn(id);
    }
}
