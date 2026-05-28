package com.hospital.management.system.controller;

import com.hospital.management.system.dto.AuthRequest;
import com.hospital.management.system.dto.AuthResponse;
import com.hospital.management.system.service.AuthService;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auth")
@CrossOrigin("*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public String register(@Valid @RequestBody AuthRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody AuthRequest request) {
        return authService.login(request.getEmail(), request.getPassword());
    }

    @GetMapping("/emails")
    public List<String> getRegisteredEmails() {
        return authService.getRegisteredEmails();
    }
}
