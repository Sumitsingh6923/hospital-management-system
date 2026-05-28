package com.hospital.management.system.controller;

import com.hospital.management.system.dto.DoctorRequest;
import com.hospital.management.system.dto.DoctorResponse;
import com.hospital.management.system.dto.PatientResponse;
import com.hospital.management.system.service.DoctorService;

import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin("*")
public class DoctorController {

    private final DoctorService service;

    public DoctorController(DoctorService service) {
        this.service = service;
    }

    // Get all doctors
    @GetMapping
    public List<DoctorResponse> getDoctors() {
        return service.getAll();
    }

    // Get doctor by ID
    @GetMapping("/{id}")
    public DoctorResponse getDoctorById(@PathVariable Long id) {
        return service.getById(id);
    }

    @GetMapping("/me/patients")
    public List<PatientResponse> getMyPatients(Authentication authentication) {
        return service.getPatientsForDoctorEmail(authentication.getName());
    }

    // Add doctor
    @PostMapping
    public DoctorResponse addDoctor(@Valid @RequestBody DoctorRequest request) {
        return service.save(request);
    }

    // Update doctor
    @PutMapping("/{id}")
    public DoctorResponse updateDoctor(@PathVariable Long id, @Valid @RequestBody DoctorRequest request) {
        return service.update(id, request);
    }

    // Delete doctor
    @DeleteMapping("/{id}")
    public String deleteDoctor(@PathVariable Long id) {
        service.delete(id);
        return "Doctor deleted successfully";
    }
}
