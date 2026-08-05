package com.catrental.service;

import com.catrental.dto.LoginRequest;
import com.catrental.dto.LoginResponse;
import com.catrental.entity.User;
import com.catrental.repository.UserRepository;
import com.catrental.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtService jwtService;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtService = jwtService;
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));

        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new BadCredentialsException("Invalid username or password"));

        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);

        String roleName = user.getRole() != null ? user.getRole().getName() : null;
        String token = jwtService.generateToken(user.getUserId(), user.getUsername(), roleName);

        return new LoginResponse(token, user.getUserId(), user.getUsername(), user.getFirstName(), user.getLastName(), roleName);
    }
}
