package com.hospital.management.system.dto;

public class DoctorResponse {
    private Long id;
    private String name;
    private String specialization;
    private String email;

    public DoctorResponse(Long id, String name, String specialization, String email) {
        this.id = id;
        this.name = name;
        this.specialization = specialization;
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getSpecialization() {
        return specialization;
    }

    public String getEmail() {
        return email;
    }
}
