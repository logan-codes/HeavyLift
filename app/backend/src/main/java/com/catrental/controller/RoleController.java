package com.catrental.controller;

import com.catrental.dto.RoleDto;
import com.catrental.repository.RoleRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
public class RoleController {

    private final RoleRepository roleRepository;

    public RoleController(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @GetMapping
    public List<RoleDto> list() {
        return roleRepository.findAll().stream()
                .map(r -> new RoleDto(r.getRoleId(), r.getName()))
                .toList();
    }
}
