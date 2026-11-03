package com.examseatx.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(unique = true, nullable = false)
    private String rollNumber;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @Email
    @Column(unique = true)
    private String email;

    @NotBlank
    private String department;

    private Integer semester;

    private String academicYear;

    private String program;

    private boolean active = true;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Student() {}

    public Student(Long id, String rollNumber, String firstName, String lastName, String email, String department, Integer semester, String academicYear, String program, boolean active, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.rollNumber = rollNumber;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.department = department;
        this.semester = semester;
        this.academicYear = academicYear;
        this.program = program;
        this.active = active;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static StudentBuilder builder() {
        return new StudentBuilder();
    }

    public static class StudentBuilder {
        private Long id;
        private String rollNumber;
        private String firstName;
        private String lastName;
        private String email;
        private String department;
        private Integer semester;
        private String academicYear;
        private String program;
        private boolean active = true;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public StudentBuilder id(Long id) { this.id = id; return this; }
        public StudentBuilder rollNumber(String rollNumber) { this.rollNumber = rollNumber; return this; }
        public StudentBuilder firstName(String firstName) { this.firstName = firstName; return this; }
        public StudentBuilder lastName(String lastName) { this.lastName = lastName; return this; }
        public StudentBuilder email(String email) { this.email = email; return this; }
        public StudentBuilder department(String department) { this.department = department; return this; }
        public StudentBuilder semester(Integer semester) { this.semester = semester; return this; }
        public StudentBuilder academicYear(String academicYear) { this.academicYear = academicYear; return this; }
        public StudentBuilder program(String program) { this.program = program; return this; }
        public StudentBuilder active(boolean active) { this.active = active; return this; }
        public StudentBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public StudentBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Student build() {
            return new Student(id, rollNumber, firstName, lastName, email, department, semester, academicYear, program, active, createdAt, updatedAt);
        }
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public String getProgram() { return program; }
    public void setProgram(String program) { this.program = program; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public String getFullName() {
        return firstName + " " + lastName;
    }
}
