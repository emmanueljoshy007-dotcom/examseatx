package com.examseatx.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "seat_assignments",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"seating_plan_id", "classroom_id", "row_number", "col_number"}),
        @UniqueConstraint(columnNames = {"seating_plan_id", "student_id"})
    }
)
public class SeatAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seating_plan_id", nullable = false)
    private SeatingPlan seatingPlan;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "classroom_id", nullable = false)
    private Classroom classroom;

    @Column(name = "row_number", nullable = false)
    private Integer row;

    @Column(name = "col_number", nullable = false)
    private Integer col;

    private String seatLabel;

    @Column(length = 1000)
    private String qrCodeData;

    private Boolean attended;

    @Column(updatable = false)
    private LocalDateTime assignedAt;

    public SeatAssignment() {}

    public SeatAssignment(Long id, SeatingPlan seatingPlan, Student student, Classroom classroom, Integer row, Integer col, String seatLabel, String qrCodeData, Boolean attended, LocalDateTime assignedAt) {
        this.id = id;
        this.seatingPlan = seatingPlan;
        this.student = student;
        this.classroom = classroom;
        this.row = row;
        this.col = col;
        this.seatLabel = seatLabel;
        this.qrCodeData = qrCodeData;
        this.attended = attended;
        this.assignedAt = assignedAt;
    }

    public static SeatAssignmentBuilder builder() {
        return new SeatAssignmentBuilder();
    }

    public static class SeatAssignmentBuilder {
        private Long id;
        private SeatingPlan seatingPlan;
        private Student student;
        private Classroom classroom;
        private Integer row;
        private Integer col;
        private String seatLabel;
        private String qrCodeData;
        private Boolean attended;
        private LocalDateTime assignedAt;

        public SeatAssignmentBuilder id(Long id) { this.id = id; return this; }
        public SeatAssignmentBuilder seatingPlan(SeatingPlan seatingPlan) { this.seatingPlan = seatingPlan; return this; }
        public SeatAssignmentBuilder student(Student student) { this.student = student; return this; }
        public SeatAssignmentBuilder classroom(Classroom classroom) { this.classroom = classroom; return this; }
        public SeatAssignmentBuilder row(Integer row) { this.row = row; return this; }
        public SeatAssignmentBuilder col(Integer col) { this.col = col; return this; }
        public SeatAssignmentBuilder seatLabel(String seatLabel) { this.seatLabel = seatLabel; return this; }
        public SeatAssignmentBuilder qrCodeData(String qrCodeData) { this.qrCodeData = qrCodeData; return this; }
        public SeatAssignmentBuilder attended(Boolean attended) { this.attended = attended; return this; }
        public SeatAssignmentBuilder assignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; return this; }

        public SeatAssignment build() {
            if (seatLabel == null && row != null && col != null) {
                seatLabel = "R" + (row + 1) + "-C" + (col + 1);
            }
            return new SeatAssignment(id, seatingPlan, student, classroom, row, col, seatLabel, qrCodeData, attended, assignedAt);
        }
    }

    @PrePersist
    protected void onCreate() {
        if (seatLabel == null && row != null && col != null) {
            seatLabel = "R" + (row + 1) + "-C" + (col + 1);
        }
        assignedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SeatingPlan getSeatingPlan() { return seatingPlan; }
    public void setSeatingPlan(SeatingPlan seatingPlan) { this.seatingPlan = seatingPlan; }

    public Student getStudent() { return student; }
    public void setStudent(Student student) { this.student = student; }

    public Classroom getClassroom() { return classroom; }
    public void setClassroom(Classroom classroom) { this.classroom = classroom; }

    public Integer getRow() { return row; }
    public void setRow(Integer row) { this.row = row; }

    public Integer getCol() { return col; }
    public void setCol(Integer col) { this.col = col; }

    public String getSeatLabel() { return seatLabel; }
    public void setSeatLabel(String seatLabel) { this.seatLabel = seatLabel; }

    public String getQrCodeData() { return qrCodeData; }
    public void setQrCodeData(String qrCodeData) { this.qrCodeData = qrCodeData; }

    public Boolean getAttended() { return attended; }
    public void setAttended(Boolean attended) { this.attended = attended; }

    public LocalDateTime getAssignedAt() { return assignedAt; }
    public void setAssignedAt(LocalDateTime assignedAt) { this.assignedAt = assignedAt; }
}
