package com.hospital.management.system.dto;

public class PatientResponse {
    private Long id;
    private String name;
    private Integer age;
    private String gender;
    private String phone;
    private String email;
    private String address;

    public PatientResponse(Long id, String name, Integer age, String gender, String phone, String email, String address) {
        this.id = id;
        this.name = name;
        this.age = age;
        this.gender = gender;
        this.phone = phone;
        this.email = email;
        this.address = address;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public Integer getAge() {
        return age;
    }

    public String getGender() {
        return gender;
    }

    public String getPhone() {
        return phone;
    }

    public String getEmail() {
        return email;
    }

    public String getAddress() {
        return address;
    }
}
