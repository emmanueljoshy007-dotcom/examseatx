package com.examseatx.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public class StudentLookupDTO {
    private String rollNumber;
    private String studentName;
    private String department;
    private String subjectName;
    private String subjectCode;
    private LocalDate examDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String roomNumber;
    private String building;
    private Integer floor;
    private int row;
    private int col;
    private String seatLabel;
    private String qrCodeData;

    public StudentLookupDTO() {}

    public StudentLookupDTO(String rollNumber, String studentName, String department, String subjectName, String subjectCode, LocalDate examDate, LocalTime startTime, LocalTime endTime, String roomNumber, String building, Integer floor, int row, int col, String seatLabel, String qrCodeData) {
        this.rollNumber = rollNumber;
        this.studentName = studentName;
        this.department = department;
        this.subjectName = subjectName;
        this.subjectCode = subjectCode;
        this.examDate = examDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.roomNumber = roomNumber;
        this.building = building;
        this.floor = floor;
        this.row = row;
        this.col = col;
        this.seatLabel = seatLabel;
        this.qrCodeData = qrCodeData;
    }

    public String getRollNumber() { return rollNumber; }
    public void setRollNumber(String rollNumber) { this.rollNumber = rollNumber; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

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

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public String getBuilding() { return building; }
    public void setBuilding(String building) { this.building = building; }

    public Integer getFloor() { return floor; }
    public void setFloor(Integer floor) { this.floor = floor; }

    public int getRow() { return row; }
    public void setRow(int row) { this.row = row; }

    public int getCol() { return col; }
    public void setCol(int col) { this.col = col; }

    public String getSeatLabel() { return seatLabel; }
    public void setSeatLabel(String seatLabel) { this.seatLabel = seatLabel; }

    public String getQrCodeData() { return qrCodeData; }
    public void setQrCodeData(String qrCodeData) { this.qrCodeData = qrCodeData; }
}

