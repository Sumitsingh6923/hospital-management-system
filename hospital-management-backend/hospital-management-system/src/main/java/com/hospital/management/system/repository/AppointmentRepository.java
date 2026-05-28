package com.hospital.management.system.repository;

import com.hospital.management.system.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    boolean existsByDoctorIdAndDateAndStatus(Long doctorId, LocalDate date, String status);
    boolean existsByDoctorIdAndDateAndAppointmentTimeAndStatus(Long doctorId, LocalDate date, String appointmentTime, String status);
    boolean existsByDoctorId(Long doctorId);
    boolean existsByPatientId(Long patientId);
    List<Appointment> findByDoctorId(Long doctorId);
    List<Appointment> findByDoctorIdAndStatus(Long doctorId, String status);
    List<Appointment> findByPatientId(Long patientId);
}
