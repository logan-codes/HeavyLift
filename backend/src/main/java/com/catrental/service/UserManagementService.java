package com.catrental.service;

import com.catrental.constants.StatusConstants;
import com.catrental.dto.CreateUserRequest;
import com.catrental.dto.UserDto;
import com.catrental.entity.Role;
import com.catrental.entity.Status;
import com.catrental.entity.User;
import com.catrental.repository.RoleRepository;
import com.catrental.repository.StatusRepository;
import com.catrental.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserManagementService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final StatusRepository statusRepository;
    private final PasswordEncoder passwordEncoder;

    public UserManagementService(UserRepository userRepository, RoleRepository roleRepository,
                                  StatusRepository statusRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.statusRepository = statusRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<UserDto> list() {
        return userRepository.findAll().stream().map(this::toDto).toList();
    }

    public UserDto create(CreateUserRequest request) {
        if (userRepository.findByUsername(request.username()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username already taken");
        }
        Role role = roleRepository.findById(request.roleId())
                .orElseThrow(() -> new EntityNotFoundException("No role with id " + request.roleId()));
        Status activeStatus = statusRepository.findById(StatusConstants.USER_ACTIVE)
                .orElseThrow(() -> new EntityNotFoundException("User active status not seeded"));

        LocalDateTime now = LocalDateTime.now();
        User user = User.builder()
                .username(request.username())
                .password(passwordEncoder.encode(request.password()))
                .firstName(request.firstName())
                .lastName(request.lastName())
                .email(request.email())
                .phone(request.phone())
                .status(activeStatus)
                .role(role)
                .isActive(true)
                .createdAt(now)
                .editedOn(now)
                .build();
        return toDto(userRepository.save(user));
    }

    private UserDto toDto(User u) {
        return new UserDto(
                u.getUserId(), u.getUsername(), u.getFirstName(), u.getLastName(), u.getEmail(), u.getPhone(),
                u.getRole() != null ? u.getRole().getName() : null,
                u.getStatus() != null ? u.getStatus().getName() : null,
                u.getIsActive()
        );
    }
}
