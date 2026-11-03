package com.examseatx.repository;

import com.examseatx.model.SeatAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatAssignmentRepository extends JpaRepository<SeatAssignment, Long> {

    List<SeatAssignment> findBySeatingPlanId(Long seatingPlanId);

    List<SeatAssignment> findByStudentRollNumber(String rollNumber);

    // Find a student's seat in a specific plan
    Optional<SeatAssignment> findBySeatingPlanIdAndStudentId(Long planId, Long studentId);

    // Find all assignments in a specific classroom within a plan
    List<SeatAssignment> findBySeatingPlanIdAndClassroomId(Long planId, Long classroomId);

    // Check if a specific seat (row, col) in a room is already taken in a plan
    boolean existsBySeatingPlanIdAndClassroomIdAndRowAndCol(
        Long planId, Long classroomId, Integer row, Integer col
    );

    // Get attendance summary for a plan
    @Query("SELECT sa.attended, COUNT(sa) FROM SeatAssignment sa WHERE sa.seatingPlan.id = :planId GROUP BY sa.attended")
    List<Object[]> getAttendanceSummary(Long planId);
}
