package com.hospital.management.system.controller;

import com.hospital.management.system.dto.AppointmentRequest;
import com.hospital.management.system.dto.AppointmentResponse;
import com.hospital.management.system.dto.AppointmentStatusRequest;
import com.hospital.management.system.service.AppointmentService;

import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/appointments")
@CrossOrigin("*")
public class AppointmentController {

    private final AppointmentService service;

    public AppointmentController(AppointmentService service) {
        this.service = service;
    }

    @GetMapping
    public List<AppointmentResponse> getAllAppointments(Authentication authentication) {
        return service.getAppointmentsForUser(authentication);
    }

    @PostMapping
    public AppointmentResponse createAppointment(
            @Valid @RequestBody AppointmentRequest request,
            Authentication authentication) {
        return service.createAppointment(request, authentication);
    }

    @GetMapping("/{id}")
    public AppointmentResponse getById(@PathVariable Long id) {
        return service.getResponseById(id);
    }

    @PatchMapping("/{id}/status")
    public AppointmentResponse updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentStatusRequest request,
            Authentication authentication) {
        return service.updateStatus(id, request.getStatus(), authentication);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.deleteAppointment(id);
        return "Appointment cancelled successfully";
    }
}
