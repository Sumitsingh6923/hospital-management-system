package com.hospital.management.system.service;

import com.hospital.management.system.dto.DoctorRequest;
import com.hospital.management.system.dto.DoctorResponse;
import com.hospital.management.system.dto.PatientResponse;
import com.hospital.management.system.entity.Appointment;
import com.hospital.management.system.entity.Doctor;
import com.hospital.management.system.entity.Patient;
import com.hospital.management.system.exception.BadRequestException;
import com.hospital.management.system.exception.ResourceNotFoundException;
import com.hospital.management.system.repository.AppointmentRepository;
import com.hospital.management.system.repository.DoctorRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class DoctorService {

    private final DoctorRepository repo;
    private final AppointmentRepository appointmentRepo;

    public DoctorService(DoctorRepository repo, AppointmentRepository appointmentRepo) {
        this.repo = repo;
        this.appointmentRepo = appointmentRepo;
    }

    public List<DoctorResponse> getAll() {
        return repo.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public Doctor getEntityById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found"));
    }

    public DoctorResponse getById(Long id) {
        return toResponse(getEntityById(id));
    }

    public DoctorResponse save(DoctorRequest request) {
        Doctor doctor = new Doctor();
        applyRequest(doctor, request);
        return toResponse(repo.save(doctor));
    }

    public DoctorResponse update(Long id, DoctorRequest request) {
        Doctor doctor = getEntityById(id);
        applyRequest(doctor, request);

        return toResponse(repo.save(doctor));
    }

    public void delete(Long id) {
        Doctor doctor = getEntityById(id);
        if (appointmentRepo.existsByDoctorId(id)) {
            throw new BadRequestException("Cannot delete doctor with existing appointments. Cancel the appointments first.");
        }

        repo.delete(doctor);
    }

    public List<PatientResponse> getPatientsForDoctorEmail(String email) {
        Doctor doctor = repo.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Doctor profile not found for logged-in user"));

        Map<Long, PatientResponse> patientsById = new LinkedHashMap<>();
        for (Appointment appointment : appointmentRepo.findByDoctorIdAndStatus(doctor.getId(), "BOOKED")) {
            Patient patient = appointment.getPatient();
            if (patient != null) {
                patientsById.put(patient.getId(), new PatientResponse(
                        patient.getId(),
                        patient.getName(),
                        patient.getAge(),
                        patient.getGender(),
                        patient.getPhone(),
                        patient.getEmail(),
                        patient.getAddress()
                ));
            }
        }

        return List.copyOf(patientsById.values());
    }

    private void applyRequest(Doctor doctor, DoctorRequest request) {
        doctor.setName(request.getName());
        doctor.setSpecialization(request.getSpecialization());
        doctor.setEmail(request.getEmail());
    }

    private DoctorResponse toResponse(Doctor doctor) {
        return new DoctorResponse(
                doctor.getId(),
                doctor.getName(),
                doctor.getSpecialization(),
                doctor.getEmail()
        );
    }
}
