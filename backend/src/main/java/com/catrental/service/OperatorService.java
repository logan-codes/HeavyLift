package com.catrental.service;

import com.catrental.dto.CreateOperatorRequest;
import com.catrental.dto.OperatorDto;
import com.catrental.entity.Operator;
import com.catrental.repository.OperatorRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OperatorService {

    private final OperatorRepository operatorRepository;

    public OperatorService(OperatorRepository operatorRepository) {
        this.operatorRepository = operatorRepository;
    }

    public List<OperatorDto> list() {
        return operatorRepository.findAll().stream().map(this::toDto).toList();
    }

    public OperatorDto create(CreateOperatorRequest request) {
        LocalDateTime now = LocalDateTime.now();
        Operator operator = Operator.builder()
                .operatorName(request.operatorName())
                .phone(request.phone())
                .licenseNumber(request.licenseNumber())
                .licenseValidity(request.licenseValidity())
                .isActive(true)
                .createdOn(now)
                .editedOn(now)
                .build();
        return toDto(operatorRepository.save(operator));
    }

    private OperatorDto toDto(Operator o) {
        return new OperatorDto(o.getOperatorId(), o.getOperatorName(), o.getPhone(),
                o.getLicenseNumber(), o.getLicenseValidity(), o.getIsActive());
    }
}
