package com.hospital.management.system.controller;

import com.hospital.management.system.dto.PatientRequest;
import com.hospital.management.system.dto.PatientResponse;
import com.hospital.management.system.service.PatientService;

import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin("*")
public class PatientController {

    private final PatientService service;

    public PatientController(PatientService service) {
        this.service = service;
    }

    @GetMapping
    public List<PatientResponse> getAllPatients() {
        return service.getAllPatients();
    }

    @GetMapping("/me")
    public PatientResponse getCurrentPatient(Authentication authentication) {
        return service.getOrCreatePatientForEmail(authentication.getName());
    }

    @GetMapping("/{id}")
    public PatientResponse getById(@PathVariable Long id) {
        return service.getPatientResponseById(id);
    }

    @PostMapping
    public PatientResponse create(@Valid @RequestBody PatientRequest patient) {
        return service.createPatient(patient);
    }

    @PutMapping("/{id}")
    public PatientResponse update(@PathVariable Long id, @Valid @RequestBody PatientRequest patient) {
        return service.updatePatient(id, patient);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.deletePatient(id);
        return "Patient deleted successfully";
    }
}
