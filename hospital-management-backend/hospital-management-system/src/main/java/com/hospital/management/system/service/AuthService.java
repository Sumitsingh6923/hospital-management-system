package com.hospital.management.system.service;

import com.hospital.management.system.entity.User;
import com.hospital.management.system.entity.Patient;
import com.hospital.management.system.entity.Doctor;
import com.hospital.management.system.dto.AuthRequest;
import com.hospital.management.system.dto.AuthResponse;
import com.hospital.management.system.repository.DoctorRepository;
import com.hospital.management.system.repository.PatientRepository;
import com.hospital.management.system.repository.UserRepository;
import com.hospital.management.system.security.JwtUtil;
import com.hospital.management.system.exception.BadRequestException;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       DoctorRepository doctorRepository,
                       PatientRepository patientRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // Register User
    @Transactional
    public String register(AuthRequest request) {
        String email = request.getEmail().trim();

        if (userRepository.findByEmail(email).isPresent()) {
            throw new BadRequestException("User already exists");
        }

        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        String normalizedRole = normalizeRole(request.getRole());
        user.setRole(normalizedRole);

        userRepository.save(user);
        createPatientProfileIfNeeded(request, email, normalizedRole);
        createDoctorProfileIfNeeded(request, email, normalizedRole);

        return "User Registered Successfully";
    }

    // Login User
    public AuthResponse login(String email, String password) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("Invalid email"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadRequestException("Invalid password");
        }

        if (user.getRole() == null || user.getRole().equalsIgnoreCase("USER")) {
            user.setRole("PATIENT");
            userRepository.save(user);
        }

        return new AuthResponse(
                jwtUtil.generateToken(user.getEmail()),
                user.getEmail(),
                user.getRole(),
                resolveFullName(user.getEmail())
        );
    }

    public List<String> getRegisteredEmails() {
        return userRepository.findAll()
                .stream()
                .map(User::getEmail)
                .filter(email -> email != null && !email.isBlank())
                .sorted(String.CASE_INSENSITIVE_ORDER)
                .toList();
    }

    private String normalizeRole(String role) {
        if (role == null || role.isBlank()) {
            return "PATIENT";
        }

        String normalizedRole = role.trim().toUpperCase();
        if (normalizedRole.startsWith("ROLE_")) {
            normalizedRole = normalizedRole.substring(5);
        }
        if (normalizedRole.equals("USER")) {
            return "PATIENT";
        }

        if (!normalizedRole.equals("ADMIN")
                && !normalizedRole.equals("DOCTOR")
                && !normalizedRole.equals("PATIENT")) {
            throw new BadRequestException("Invalid role");
        }

        return normalizedRole;
    }

    private String resolveFullName(String email) {
        return doctorRepository.findByEmail(email)
                .map(doctor -> doctor.getName())
                .or(() -> patientRepository.findByEmail(email).map(patient -> patient.getName()))
                .filter(name -> name != null && !name.isBlank())
                .orElseGet(() -> formatEmailUsername(email));
    }

    private void createPatientProfileIfNeeded(AuthRequest request, String email, String role) {
        if (!"PATIENT".equals(role) || patientRepository.findByEmail(email).isPresent()) {
            return;
        }

        if (request.getFullName() == null || request.getFullName().isBlank()) {
            throw new BadRequestException("Full name is required");
        }

        if (request.getAge() == null) {
            throw new BadRequestException("Age is required");
        }

        if (request.getGender() == null || request.getGender().isBlank()) {
            throw new BadRequestException("Gender is required");
        }

        if (request.getPhone() == null || request.getPhone().isBlank()) {
            throw new BadRequestException("Phone number is required");
        }

        Patient patient = new Patient();
        patient.setEmail(email);
        patient.setName(request.getFullName().trim());
        patient.setAge(request.getAge());
        patient.setGender(request.getGender().trim());
        patient.setPhone(request.getPhone().trim());
        patient.setAddress(request.getAddress() == null ? "" : request.getAddress().trim());
        patientRepository.save(patient);
    }

    private void createDoctorProfileIfNeeded(AuthRequest request, String email, String role) {
        if (!"DOCTOR".equals(role) || doctorRepository.findByEmail(email).isPresent()) {
            return;
        }

        if (request.getFullName() == null || request.getFullName().isBlank()) {
            throw new BadRequestException("Full name is required");
        }

        if (request.getSpecialization() == null || request.getSpecialization().isBlank()) {
            throw new BadRequestException("Specialization is required");
        }

        Doctor doctor = new Doctor();
        doctor.setEmail(email);
        doctor.setName(request.getFullName().trim());
        doctor.setSpecialization(request.getSpecialization().trim());
        doctorRepository.save(doctor);
    }

    private String formatEmailUsername(String email) {
        if (email == null || email.isBlank()) {
            return "User";
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

        return displayName.isEmpty() ? "User" : displayName.toString();
    }
}
