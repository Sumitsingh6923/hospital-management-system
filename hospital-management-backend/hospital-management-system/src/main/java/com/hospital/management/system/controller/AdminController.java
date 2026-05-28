package com.hospital.management.system.controller;

import com.hospital.management.system.dto.RoleUpdateRequest;
import com.hospital.management.system.dto.UserResponse;
import com.hospital.management.system.entity.User;
import com.hospital.management.system.exception.BadRequestException;
import com.hospital.management.system.exception.ResourceNotFoundException;
import com.hospital.management.system.repository.UserRepository;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin("*")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/users")
    public List<UserResponse> getUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @PutMapping("/users/{id}/role")
    public UserResponse updateRole(@PathVariable Long id, @Valid @RequestBody RoleUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setRole(normalizeRole(request.getRole()));
        return toResponse(userRepository.save(user));
    }

    @DeleteMapping("/users/{id}")
    public String deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        userRepository.delete(user);
        return "User deleted successfully";
    }

    private String normalizeRole(String role) {
        if (role == null || role.isBlank()) {
            throw new BadRequestException("Role is required");
        }

        String normalizedRole = role.trim().toUpperCase();
        if (normalizedRole.startsWith("ROLE_")) {
            normalizedRole = normalizedRole.substring(5);
        }

        if (!normalizedRole.equals("ADMIN")
                && !normalizedRole.equals("DOCTOR")
                && !normalizedRole.equals("PATIENT")) {
            throw new BadRequestException("Invalid role");
        }

        return normalizedRole;
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getRole());
    }
}
