package com.catrental.controller;

import com.catrental.dto.CreateUserRequest;
import com.catrental.dto.UserDto;
import com.catrental.service.UserManagementService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('SYSTEM_ADMIN')")
public class UserController {

    private final UserManagementService userManagementService;

    public UserController(UserManagementService userManagementService) {
        this.userManagementService = userManagementService;
    }

    @GetMapping
    public List<UserDto> list() {
        return userManagementService.list();
    }

    @PostMapping
    public UserDto create(@Valid @RequestBody CreateUserRequest request) {
        return userManagementService.create(request);
    }
}
