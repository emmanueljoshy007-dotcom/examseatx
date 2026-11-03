package com.examseatx.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "seating_plans")
public class SeatingPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_id", nullable = false)
    private Exam exam;

    @Enumerated(EnumType.STRING)
    private PlanStatus status = PlanStatus.GENERATING;

    private boolean active = false;

    private Long generationTimeMs;

    private Integer assignedCount;

    private Integer unassignedCount = 0;

    @Column(length = 2000)
    private String engineNotes;

    @OneToMany(mappedBy = "seatingPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<SeatAssignment> assignments = new ArrayList<>();

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public SeatingPlan() {}

    public SeatingPlan(Long id, Exam exam, PlanStatus status, boolean active, Long generationTimeMs, Integer assignedCount, Integer unassignedCount, String engineNotes, List<SeatAssignment> assignments, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.exam = exam;
        this.status = status != null ? status : PlanStatus.GENERATING;
        this.active = active;
        this.generationTimeMs = generationTimeMs;
        this.assignedCount = assignedCount;
        this.unassignedCount = unassignedCount != null ? unassignedCount : 0;
        this.engineNotes = engineNotes;
        this.assignments = assignments != null ? assignments : new ArrayList<>();
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static SeatingPlanBuilder builder() {
        return new SeatingPlanBuilder();
    }

    public static class SeatingPlanBuilder {
        private Long id;
        private Exam exam;
        private PlanStatus status = PlanStatus.GENERATING;
        private boolean active = false;
        private Long generationTimeMs;
        private Integer assignedCount;
        private Integer unassignedCount = 0;
        private String engineNotes;
        private List<SeatAssignment> assignments = new ArrayList<>();
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public SeatingPlanBuilder id(Long id) { this.id = id; return this; }
        public SeatingPlanBuilder exam(Exam exam) { this.exam = exam; return this; }
        public SeatingPlanBuilder status(PlanStatus status) { this.status = status; return this; }
        public SeatingPlanBuilder active(boolean active) { this.active = active; return this; }
        public SeatingPlanBuilder generationTimeMs(Long generationTimeMs) { this.generationTimeMs = generationTimeMs; return this; }
        public SeatingPlanBuilder assignedCount(Integer assignedCount) { this.assignedCount = assignedCount; return this; }
        public SeatingPlanBuilder unassignedCount(Integer unassignedCount) { this.unassignedCount = unassignedCount; return this; }
        public SeatingPlanBuilder engineNotes(String engineNotes) { this.engineNotes = engineNotes; return this; }
        public SeatingPlanBuilder assignments(List<SeatAssignment> assignments) { this.assignments = assignments; return this; }
        public SeatingPlanBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public SeatingPlanBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public SeatingPlan build() {
            return new SeatingPlan(id, exam, status, active, generationTimeMs, assignedCount, unassignedCount, engineNotes, assignments, createdAt, updatedAt);
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

    public Exam getExam() { return exam; }
    public void setExam(Exam exam) { this.exam = exam; }

    public PlanStatus getStatus() { return status; }
    public void setStatus(PlanStatus status) { this.status = status; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public Long getGenerationTimeMs() { return generationTimeMs; }
    public void setGenerationTimeMs(Long generationTimeMs) { this.generationTimeMs = generationTimeMs; }

    public Integer getAssignedCount() { return assignedCount; }
    public void setAssignedCount(Integer assignedCount) { this.assignedCount = assignedCount; }

    public Integer getUnassignedCount() { return unassignedCount; }
    public void setUnassignedCount(Integer unassignedCount) { this.unassignedCount = unassignedCount; }

    public String getEngineNotes() { return engineNotes; }
    public void setEngineNotes(String engineNotes) { this.engineNotes = engineNotes; }

    public List<SeatAssignment> getAssignments() { return assignments; }
    public void setAssignments(List<SeatAssignment> assignments) { this.assignments = assignments; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public enum PlanStatus {
        GENERATING, SUCCESS, FAILED, PUBLISHED, ARCHIVED
    }
}
