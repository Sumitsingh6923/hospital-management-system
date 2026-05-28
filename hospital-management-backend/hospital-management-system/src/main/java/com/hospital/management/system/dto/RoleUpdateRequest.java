package com.hospital.management.system.dto;

import jakarta.validation.constraints.NotBlank;

public class RoleUpdateRequest {
    @NotBlank(message = "Role is required")
    private String role;

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
