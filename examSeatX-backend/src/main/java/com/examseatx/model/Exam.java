package com.examseatx.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "exams")
public class Exam {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String subjectName;

    @NotBlank
    private String subjectCode;

    @NotNull
    private LocalDate examDate;

    @NotNull
    private LocalTime startTime;

    @NotNull
    private LocalTime endTime;

    private Integer durationMinutes;

    private String department;

    private Integer semester;

    private String academicYear;

    @Enumerated(EnumType.STRING)
    private ExamStatus status = ExamStatus.SCHEDULED;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "exam_students",
        joinColumns = @JoinColumn(name = "exam_id"),
        inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    private List<Student> enrolledStudents = new ArrayList<>();

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Exam() {}

    public Exam(Long id, String subjectName, String subjectCode, LocalDate examDate, LocalTime startTime, LocalTime endTime, Integer durationMinutes, String department, Integer semester, String academicYear, ExamStatus status, List<Student> enrolledStudents, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.subjectName = subjectName;
        this.subjectCode = subjectCode;
        this.examDate = examDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.durationMinutes = durationMinutes;
        this.department = department;
        this.semester = semester;
        this.academicYear = academicYear;
        this.status = status != null ? status : ExamStatus.SCHEDULED;
        this.enrolledStudents = enrolledStudents != null ? enrolledStudents : new ArrayList<>();
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static ExamBuilder builder() {
        return new ExamBuilder();
    }

    public static class ExamBuilder {
        private Long id;
        private String subjectName;
        private String subjectCode;
        private LocalDate examDate;
        private LocalTime startTime;
        private LocalTime endTime;
        private Integer durationMinutes;
        private String department;
        private Integer semester;
        private String academicYear;
        private ExamStatus status = ExamStatus.SCHEDULED;
        private List<Student> enrolledStudents = new ArrayList<>();
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public ExamBuilder id(Long id) { this.id = id; return this; }
        public ExamBuilder subjectName(String subjectName) { this.subjectName = subjectName; return this; }
        public ExamBuilder subjectCode(String subjectCode) { this.subjectCode = subjectCode; return this; }
        public ExamBuilder examDate(LocalDate examDate) { this.examDate = examDate; return this; }
        public ExamBuilder startTime(LocalTime startTime) { this.startTime = startTime; return this; }
        public ExamBuilder endTime(LocalTime endTime) { this.endTime = endTime; return this; }
        public ExamBuilder durationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; return this; }
        public ExamBuilder department(String department) { this.department = department; return this; }
        public ExamBuilder semester(Integer semester) { this.semester = semester; return this; }
        public ExamBuilder academicYear(String academicYear) { this.academicYear = academicYear; return this; }
        public ExamBuilder status(ExamStatus status) { this.status = status; return this; }
        public ExamBuilder enrolledStudents(List<Student> enrolledStudents) { this.enrolledStudents = enrolledStudents; return this; }
        public ExamBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public ExamBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Exam build() {
            if (durationMinutes == null && startTime != null && endTime != null) {
                durationMinutes = (int) java.time.Duration.between(startTime, endTime).toMinutes();
            }
            return new Exam(id, subjectName, subjectCode, examDate, startTime, endTime, durationMinutes, department, semester, academicYear, status, enrolledStudents, createdAt, updatedAt);
        }
    }

    @PrePersist
    protected void onCreate() {
        if (durationMinutes == null && startTime != null && endTime != null) {
            durationMinutes = (int) java.time.Duration.between(startTime, endTime).toMinutes();
        }
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public LocalDate getExamDate() { return examDate; }
    public void setExamDate(LocalDate examDate) { this.examDate = examDate; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public LocalTime getEndTime() { return endTime; }
    public void setEndTime(LocalTime endTime) { this.endTime = endTime; }

    public Integer getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(Integer durationMinutes) { this.durationMinutes = durationMinutes; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Integer getSemester() { return semester; }
    public void setSemester(Integer semester) { this.semester = semester; }

    public String getAcademicYear() { return academicYear; }
    public void setAcademicYear(String academicYear) { this.academicYear = academicYear; }

    public ExamStatus getStatus() { return status; }
    public void setStatus(ExamStatus status) { this.status = status; }

    public List<Student> getEnrolledStudents() { return enrolledStudents; }
    public void setEnrolledStudents(List<Student> enrolledStudents) { this.enrolledStudents = enrolledStudents; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public enum ExamStatus {
        SCHEDULED,
        SEATING_GENERATED,
        PUBLISHED,
        COMPLETED,
        CANCELLED
    }
}
