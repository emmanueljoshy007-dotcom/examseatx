package com.examseatx.service;

import com.examseatx.model.Classroom;
import com.examseatx.model.Exam;
import com.examseatx.model.SeatingPlan;
import com.examseatx.model.Student;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class AllocationEngineServiceTest {

    private AllocationEngineService engine;

    @BeforeEach
    public void setup() {
        engine = new AllocationEngineService();
    }

    @Test
    @DisplayName("CSP Engine: Zero adjacency conflict when allocating mixed-department exam")
    public void testZeroAdjacencyConflictMixedDepartments() {
        // Create 20 students: 10 CS and 10 EC
        List<Student> students = new ArrayList<>();
        for (int i = 1; i <= 10; i++) {
            students.add(Student.builder()
                    .id((long) i)
                    .rollNumber("CS" + (100 + i))
                    .firstName("CSStudent" + i)
                    .lastName("Sharma")
                    .department("Computer Science")
                    .semester(5)
                    .build());
        }
        for (int i = 1; i <= 10; i++) {
            students.add(Student.builder()
                    .id((long) (10 + i))
                    .rollNumber("EC" + (100 + i))
                    .firstName("ECStudent" + i)
                    .lastName("Patel")
                    .department("Electronics")
                    .semester(5)
                    .build());
        }

        Exam exam = Exam.builder()
                .id(1L)
                .subjectName("Engineering Mathematics III")
                .subjectCode("MA301")
                .examDate(LocalDate.now().plusDays(5))
                .startTime(LocalTime.of(9, 30))
                .endTime(LocalTime.of(12, 30))
                .enrolledStudents(students)
                .build();

        // Classroom: 6 rows x 6 columns = 36 seats
        Classroom hall = Classroom.builder()
                .id(1L)
                .roomNumber("EH-101")
                .rows(6)
                .columns(6)
                .capacity(36)
                .available(true)
                .build();

        SeatingPlan plan = SeatingPlan.builder()
                .id(1L)
                .exam(exam)
                .build();

        AllocationEngineService.AllocationResult result = engine.allocate(exam, List.of(hall), plan);

        // Assertions
        assertNotNull(result);
        assertEquals(20, result.getAssignments().size(), "All 20 students should be assigned seats");
        assertEquals(0, result.getUnassignedStudents().size(), "Zero students unassigned");
        assertEquals(0, result.getConflictViolations(), "Engine must guarantee ZERO adjacency conflicts!");
        assertTrue(result.getExecutionTimeMs() < 500, "CSP engine should solve within 500ms");
    }
}

