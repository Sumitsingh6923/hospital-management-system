package com.hospital.management.system.dto;

import java.time.LocalDate;

public class AppointmentResponse {
    private Long id;
    private LocalDate date;
    private String status;
    private Long doctorId;
    private String doctorName;
    private Long patientId;
    private String patientName;
    private String appointmentTime;
    private boolean emergency;
    private String symptoms;

    public AppointmentResponse(
            Long id,
            LocalDate date,
            String status,
            Long doctorId,
            String doctorName,
            Long patientId,
            String patientName,
            String appointmentTime,
            boolean emergency,
            String symptoms) {
        this.id = id;
        this.date = date;
        this.status = status;
        this.doctorId = doctorId;
        this.doctorName = doctorName;
        this.patientId = patientId;
        this.patientName = patientName;
        this.appointmentTime = appointmentTime;
        this.emergency = emergency;
        this.symptoms = symptoms;
    }

    public Long getId() {
        return id;
    }

    public LocalDate getDate() {
        return date;
    }

    public String getStatus() {
        return status;
    }

    public Long getDoctorId() {
        return doctorId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public Long getPatientId() {
        return patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public String getAppointmentTime() {
        return appointmentTime;
    }

    public boolean isEmergency() {
        return emergency;
    }

    public String getSymptoms() {
        return symptoms;
    }
}
