package com.examseatx.controller;

import com.examseatx.repository.ClassroomRepository;
import com.examseatx.repository.ExamRepository;
import com.examseatx.repository.SeatAssignmentRepository;
import com.examseatx.repository.StudentRepository;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final StudentRepository studentRepository;
    private final ClassroomRepository classroomRepository;
    private final ExamRepository examRepository;
    private final SeatAssignmentRepository seatAssignmentRepository;

    public DashboardController(StudentRepository studentRepository,
                               ClassroomRepository classroomRepository,
                               ExamRepository examRepository,
                               SeatAssignmentRepository seatAssignmentRepository) {
        this.studentRepository = studentRepository;
        this.classroomRepository = classroomRepository;
        this.examRepository = examRepository;
        this.seatAssignmentRepository = seatAssignmentRepository;
    }

    @GetMapping("/stats")
    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents", studentRepository.count());
        stats.put("totalClassrooms", classroomRepository.count());
        stats.put("availableCapacity", classroomRepository.totalAvailableCapacity());
        stats.put("totalExams", examRepository.count());
        stats.put("totalAllocatedSeats", seatAssignmentRepository.count());
        return stats;
    }
}

