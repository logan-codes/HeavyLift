package com.catrental.service;

import com.catrental.constants.StatusConstants;
import com.catrental.dto.CreateSiteRequest;
import com.catrental.dto.SiteDto;
import com.catrental.entity.Site;
import com.catrental.entity.Status;
import com.catrental.repository.SiteRepository;
import com.catrental.repository.StatusRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class SiteService {

    private final SiteRepository siteRepository;
    private final StatusRepository statusRepository;

    public SiteService(SiteRepository siteRepository, StatusRepository statusRepository) {
        this.siteRepository = siteRepository;
        this.statusRepository = statusRepository;
    }

    public List<SiteDto> list() {
        return siteRepository.findAll().stream().map(this::toDto).toList();
    }

    public SiteDto create(CreateSiteRequest request) {
        Status activeStatus = statusRepository.findById(StatusConstants.SITE_ACTIVE)
                .orElseThrow(() -> new EntityNotFoundException("Site active status not seeded"));
        LocalDateTime now = LocalDateTime.now();
        Site site = Site.builder()
                .name(request.name())
                .address(request.address())
                .latitude(request.latitude())
                .longitude(request.longitude())
                .status(activeStatus)
                .isActive(true)
                .createdOn(now)
                .editedOn(now)
                .build();
        return toDto(siteRepository.save(site));
    }

    private SiteDto toDto(Site s) {
        return new SiteDto(
                s.getSiteId(), s.getName(), s.getAddress(), s.getLatitude(), s.getLongitude(),
                s.getStatus() != null ? s.getStatus().getStatusId() : null,
                s.getStatus() != null ? s.getStatus().getName() : null,
                s.getIsActive()
        );
    }
}
