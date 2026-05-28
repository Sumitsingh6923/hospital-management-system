package com.hospital.management.system.service;

import com.hospital.management.system.dto.PatientRequest;
import com.hospital.management.system.dto.PatientResponse;
import com.hospital.management.system.entity.Patient;
import com.hospital.management.system.entity.Appointment;
import com.hospital.management.system.exception.ResourceNotFoundException;
import com.hospital.management.system.repository.AppointmentRepository;
import com.hospital.management.system.repository.PatientRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PatientService {

    private final PatientRepository patientRepo;
    private final AppointmentRepository appointmentRepo;

    public PatientService(PatientRepository patientRepo, AppointmentRepository appointmentRepo) {
        this.patientRepo = patientRepo;
        this.appointmentRepo = appointmentRepo;
    }

    // Get all patients
    public List<PatientResponse> getAllPatients() {
        return patientRepo.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // Get patient by ID
    public Patient getPatientById(Long id) {
        return patientRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
    }

    public PatientResponse getPatientResponseById(Long id) {
        return toResponse(getPatientById(id));
    }

    public PatientResponse getOrCreatePatientForEmail(String email) {
        Patient patient = patientRepo.findByEmail(email)
                .orElseGet(() -> createPatientProfile(email));

        return toResponse(patient);
    }

    // Create patient
    public PatientResponse createPatient(PatientRequest request) {
        Patient patient = new Patient();
        applyRequest(patient, request);
        return toResponse(patientRepo.save(patient));
    }

    // Update patient
    public PatientResponse updatePatient(Long id, PatientRequest request) {

        Patient patient = getPatientById(id);
        applyRequest(patient, request);
        return toResponse(patientRepo.save(patient));
    }

    // Delete patient
    @Transactional
    public void deletePatient(Long id) {
        Patient patient = getPatientById(id);

        for (Appointment appointment : appointmentRepo.findByPatientId(id)) {
            appointment.setStatus("CANCELLED");
            appointment.setPatient(null);
        }

        patientRepo.delete(patient);
    }

    private void applyRequest(Patient patient, PatientRequest request) {
        patient.setName(request.getName());
        patient.setAge(request.getAge());
        patient.setGender(request.getGender());
        patient.setPhone(request.getPhone());
        patient.setEmail(request.getEmail());
        patient.setAddress(request.getAddress());
    }

    private Patient createPatientProfile(String email) {
        Patient patient = new Patient();
        patient.setName(formatEmailUsername(email));
        patient.setAge(null);
        patient.setGender("");
        patient.setPhone("");
        patient.setEmail(email);
        patient.setAddress("");
        return patientRepo.save(patient);
    }

    private String formatEmailUsername(String email) {
        if (email == null || email.isBlank()) {
            return "Patient";
        }

        String username = email.split("@")[0].replace(".", " ").replace("_", " ").replace("-", " ");
        String[] parts = username.trim().split("\\s+");
        StringBuilder displayName = new StringBuilder();

        for (String part : parts) {
            if (part.isBlank()) {
                continue;
            }

            if (!displayName.isEmpty()) {
                displayName.append(" ");
            }
            displayName.append(part.substring(0, 1).toUpperCase()).append(part.substring(1).toLowerCase());
        }

        return displayName.isEmpty() ? "Patient" : displayName.toString();
    }

    private PatientResponse toResponse(Patient patient) {
        return new PatientResponse(
                patient.getId(),
                patient.getName(),
                patient.getAge(),
                patient.getGender(),
                patient.getPhone(),
                patient.getEmail(),
                patient.getAddress()
        );
    }
}
