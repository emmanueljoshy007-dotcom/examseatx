package com.examseatx.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public class SeatingAllocationResponse {
    private Long planId;
    private Long examId;
    private String subjectName;
    private String subjectCode;
    private LocalDate examDate;
    private LocalTime startTime;
    private int assignedCount;
    private int unassignedCount;
    private long executionTimeMs;
    private String status;
    private String message;
    private List<SeatAssignmentDTO> assignments;

    public SeatingAllocationResponse() {}

    public SeatingAllocationResponse(Long planId, Long examId, String subjectName, String subjectCode, LocalDate examDate, LocalTime startTime, int assignedCount, int unassignedCount, long executionTimeMs, String status, String message, List<SeatAssignmentDTO> assignments) {
        this.planId = planId;
        this.examId = examId;
        this.subjectName = subjectName;
        this.subjectCode = subjectCode;
        this.examDate = examDate;
        this.startTime = startTime;
        this.assignedCount = assignedCount;
        this.unassignedCount = unassignedCount;
        this.executionTimeMs = executionTimeMs;
        this.status = status;
        this.message = message;
        this.assignments = assignments;
    }

    public Long getPlanId() { return planId; }
    public void setPlanId(Long planId) { this.planId = planId; }

    public Long getExamId() { return examId; }
    public void setExamId(Long examId) { this.examId = examId; }

    public String getSubjectName() { return subjectName; }
    public void setSubjectName(String subjectName) { this.subjectName = subjectName; }

    public String getSubjectCode() { return subjectCode; }
    public void setSubjectCode(String subjectCode) { this.subjectCode = subjectCode; }

    public LocalDate getExamDate() { return examDate; }
    public void setExamDate(LocalDate examDate) { this.examDate = examDate; }

    public LocalTime getStartTime() { return startTime; }
    public void setStartTime(LocalTime startTime) { this.startTime = startTime; }

    public int getAssignedCount() { return assignedCount; }
    public void setAssignedCount(int assignedCount) { this.assignedCount = assignedCount; }

    public int getUnassignedCount() { return unassignedCount; }
    public void setUnassignedCount(int unassignedCount) { this.unassignedCount = unassignedCount; }

    public long getExecutionTimeMs() { return executionTimeMs; }
    public void setExecutionTimeMs(long executionTimeMs) { this.executionTimeMs = executionTimeMs; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public List<SeatAssignmentDTO> getAssignments() { return assignments; }
    public void setAssignments(List<SeatAssignmentDTO> assignments) { this.assignments = assignments; }

    public static class SeatAssignmentDTO {
        private Long id;
        private String rollNumber;
        private String studentName;
        private String department;
        private String roomNumber;
        private String building;
        private int row;
        private int col;
        private String seatLabel;
        private String qrCodeData;

        public SeatAssignmentDTO() {}

        public SeatAssignmentDTO(Long id, String rollNumber, String studentName, String department, String roomNumber, String building, int row, int col, String seatLabel, String qrCodeData) {
            this.id = id;
            this.rollNumber = rollNumber;
            this.studentName = studentName;
            this.department = department;
            this.roomNumber = roomNumber;
            this.building = building;
            this.row = row;
            this.col = col;
            this.seatLabel = seatLabel;
            this.qrCodeData = qrCodeData;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getRollNumber() { return rollNumber; }
        public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

        public String getStudentName() { return studentName; }
        public void setStudentName(String studentName) { this.studentName = studentName; }

        public String getDepartment() { return department; }
        public void setDepartment(String department) { this.department = department; }

        public String getRoomNumber() { return roomNumber; }
        public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

        public String getBuilding() { return building; }
        public void setBuilding(String building) { this.building = building; }

        public int getRow() { return row; }
        public void setRow(int row) { this.row = row; }

        public int getCol() { return col; }
        public void setCol(int col) { this.col = col; }

        public String getSeatLabel() { return seatLabel; }
        public void setSeatLabel(String seatLabel) { this.seatLabel = seatLabel; }

        public String getQrCodeData() { return qrCodeData; }
        public void setQrCodeData(String qrCodeData) { this.qrCodeData = qrCodeData; }
    }
}

