package com.catrental.controller;

import com.catrental.dto.CreateSiteRequest;
import com.catrental.dto.SiteDto;
import com.catrental.service.SiteService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sites")
public class SiteController {

    private final SiteService siteService;

    public SiteController(SiteService siteService) {
        this.siteService = siteService;
    }

    @GetMapping
    public List<SiteDto> list() {
        return siteService.list();
    }

    @PostMapping
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public SiteDto create(@Valid @RequestBody CreateSiteRequest request) {
        return siteService.create(request);
    }
}
