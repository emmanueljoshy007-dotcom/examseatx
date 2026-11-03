package com.examseatx.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "classrooms")
public class Classroom {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(unique = true, nullable = false)
    private String roomNumber;

    private String building;

    private Integer floor;

    @Min(1)
    @Column(nullable = false)
    private Integer rows;

    @Min(1)
    @Column(nullable = false)
    private Integer columns;

    @Column(nullable = false)
    private Integer capacity;

    private boolean available = true;

    private String notes;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public Classroom() {}

    public Classroom(Long id, String roomNumber, String building, Integer floor, Integer rows, Integer columns, Integer capacity, boolean available, String notes, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.roomNumber = roomNumber;
        this.building = building;
        this.floor = floor;
        this.rows = rows;
        this.columns = columns;
        this.capacity = capacity;
        this.available = available;
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static ClassroomBuilder builder() {
        return new ClassroomBuilder();
    }

    public static class ClassroomBuilder {
        private Long id;
        private String roomNumber;
        private String building;
        private Integer floor;
        private Integer rows;
        private Integer columns;
        private Integer capacity;
        private boolean available = true;
        private String notes;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public ClassroomBuilder id(Long id) { this.id = id; return this; }
        public ClassroomBuilder roomNumber(String roomNumber) { this.roomNumber = roomNumber; return this; }
        public ClassroomBuilder building(String building) { this.building = building; return this; }
        public ClassroomBuilder floor(Integer floor) { this.floor = floor; return this; }
        public ClassroomBuilder rows(Integer rows) { this.rows = rows; return this; }
        public ClassroomBuilder columns(Integer columns) { this.columns = columns; return this; }
        public ClassroomBuilder capacity(Integer capacity) { this.capacity = capacity; return this; }
        public ClassroomBuilder available(boolean available) { this.available = available; return this; }
        public ClassroomBuilder notes(String notes) { this.notes = notes; return this; }
        public ClassroomBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public ClassroomBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public Classroom build() {
            if (capacity == null && rows != null && columns != null) {
                capacity = rows * columns;
            }
            return new Classroom(id, roomNumber, building, floor, rows, columns, capacity, available, notes, createdAt, updatedAt);
        }
    }

    @PrePersist
    protected void onCreate() {
        if (capacity == null && rows != null && columns != null) {
            capacity = rows * columns;
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

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public String getBuilding() { return building; }
    public void setBuilding(String building) { this.building = building; }

    public Integer getFloor() { return floor; }
    public void setFloor(Integer floor) { this.floor = floor; }

    public Integer getRows() { return rows; }
    public void setRows(Integer rows) { this.rows = rows; }

    public Integer getColumns() { return columns; }
    public void setColumns(Integer columns) { this.columns = columns; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
