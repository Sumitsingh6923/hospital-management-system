package com.hospital.management.system.service;

import com.hospital.management.system.dto.AppointmentRequest;
import com.hospital.management.system.dto.AppointmentResponse;
import com.hospital.management.system.entity.Appointment;
import com.hospital.management.system.entity.Doctor;
import com.hospital.management.system.entity.Patient;
import com.hospital.management.system.exception.BadRequestException;
import com.hospital.management.system.exception.ResourceNotFoundException;
import com.hospital.management.system.repository.AppointmentRepository;
import com.hospital.management.system.repository.DoctorRepository;
import com.hospital.management.system.repository.PatientRepository;

import org.springframework.stereotype.Service;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepo;
    private final DoctorRepository doctorRepo;
    private final PatientRepository patientRepo;

    public AppointmentService(AppointmentRepository appointmentRepo,
                              DoctorRepository doctorRepo,
                              PatientRepository patientRepo) {
        this.appointmentRepo = appointmentRepo;
        this.doctorRepo = doctorRepo;
        this.patientRepo = patientRepo;
    }

    // Get all appointments
    public List<AppointmentResponse> getAllAppointments() {
        return appointmentRepo.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<AppointmentResponse> getAppointmentsForUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new BadRequestException("Authenticated user is required");
        }

        String email = authentication.getName();
        boolean isAdmin = hasRole(authentication, "ROLE_ADMIN");
        boolean isDoctor = hasRole(authentication, "ROLE_DOCTOR");
        boolean isPatient = hasRole(authentication, "ROLE_PATIENT");

        if (isAdmin) {
            return getAllAppointments();
        }

        if (isDoctor) {
            Doctor doctor = doctorRepo.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for logged-in user"));

            return appointmentRepo.findByDoctorId(doctor.getId())
                    .stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }

        if (isPatient) {
            Patient patient = patientRepo.findByEmail(email)
                    .orElseGet(() -> createPatientProfile(email));

            return appointmentRepo.findByPatientId(patient.getId())
                    .stream()
                    .map(this::toResponse)
                    .collect(Collectors.toList());
        }

        throw new BadRequestException("Unsupported user role");
    }

    // Create appointment
    public AppointmentResponse createAppointment(AppointmentRequest request, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new BadRequestException("Authenticated user is required");
        }

        Doctor doctor = doctorRepo.findById(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));

        Patient patient = resolveAppointmentPatient(request, authentication);

        String appointmentTime = request.getAppointmentTime().trim();
        if (appointmentRepo.existsByDoctorIdAndDateAndAppointmentTimeAndStatus(
                doctor.getId(), request.getDate(), appointmentTime, "BOOKED")) {
            throw new BadRequestException("Doctor is already booked for this time slot");
        }

        Appointment appointment = new Appointment();
        appointment.setDate(request.getDate());
        appointment.setAppointmentTime(appointmentTime);
        appointment.setEmergency(request.isEmergency());
        appointment.setSymptoms(request.getSymptoms() == null ? "" : request.getSymptoms().trim());
        appointment.setStatus("BOOKED");
        appointment.setDoctor(doctor);
        appointment.setPatient(patient);

        return toResponse(appointmentRepo.save(appointment));
    }

    private Patient resolveAppointmentPatient(AppointmentRequest request, Authentication authentication) {
        if (hasRole(authentication, "ROLE_PATIENT")) {
            return patientRepo.findByEmail(authentication.getName())
                    .orElseGet(() -> createPatientProfile(authentication.getName()));
        }

        if (request.getPatientId() == null) {
            throw new BadRequestException("Patient is required");
        }

        return patientRepo.findById(request.getPatientId())
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found"));
    }

    private Patient createPatientProfile(String email) {
        Patient patient = new Patient();
        patient.setEmail(email);
        patient.setName(formatEmailUsername(email));
        patient.setAge(null);
        patient.setGender("");
        patient.setPhone("");
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

    // Get appointment by ID
    public Appointment getById(Long id) {
        return appointmentRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
    }

    public AppointmentResponse getResponseById(Long id) {
        return toResponse(getById(id));
    }

    public AppointmentResponse updateStatus(Long id, String status, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new BadRequestException("Authenticated user is required");
        }

        Appointment appointment = getById(id);
        boolean isAdmin = hasRole(authentication, "ROLE_ADMIN");
        boolean isDoctor = hasRole(authentication, "ROLE_DOCTOR");

        if (!isAdmin && !isDoctor) {
            throw new BadRequestException("Only admins and doctors can update appointment status");
        }

        if (isDoctor) {
            Doctor doctor = doctorRepo.findByEmail(authentication.getName())
                    .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for logged-in user"));

            if (appointment.getDoctor() == null || !doctor.getId().equals(appointment.getDoctor().getId())) {
                throw new BadRequestException("Doctors can update only their own appointments");
            }
        }

        appointment.setStatus(normalizeStatus(status));
        return toResponse(appointmentRepo.save(appointment));
    }

    // Delete appointment
    public void deleteAppointment(Long id) {
        Appointment appointment = getById(id);
        appointment.setStatus("CANCELLED");
        appointmentRepo.save(appointment);
    }

    private AppointmentResponse toResponse(Appointment appointment) {
        Doctor doctor = appointment.getDoctor();
        Patient patient = appointment.getPatient();

        return new AppointmentResponse(
                appointment.getId(),
                appointment.getDate(),
                appointment.getStatus() != null ? appointment.getStatus() : "BOOKED",
                doctor != null ? doctor.getId() : null,
                doctor != null ? doctor.getName() : null,
                patient != null ? patient.getId() : null,
                patient != null ? patient.getName() : null,
                appointment.getAppointmentTime(),
                appointment.isEmergency(),
                appointment.getSymptoms()
        );
    }

    private boolean hasRole(Authentication authentication, String role) {
        return authentication.getAuthorities()
                .stream()
                .anyMatch(authority -> role.equals(authority.getAuthority()));
    }

    private String normalizeStatus(String status) {
        String normalizedStatus = status == null ? "" : status.trim().toUpperCase();

        if (!normalizedStatus.equals("BOOKED")
                && !normalizedStatus.equals("COMPLETED")
                && !normalizedStatus.equals("CANCELLED")) {
            throw new BadRequestException("Status must be BOOKED, COMPLETED, or CANCELLED");
        }

        return normalizedStatus;
    }
}
