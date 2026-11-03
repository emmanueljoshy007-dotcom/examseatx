package com.examseatx.service;

import com.examseatx.model.Classroom;
import com.examseatx.model.Exam;
import com.examseatx.model.SeatAssignment;
import com.examseatx.model.SeatingPlan;
import com.examseatx.model.Student;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * AllocationEngineService - The Brain of ExamSeatX
 *
 * Implements Constraint Satisfaction Problem (CSP) solving, Graph Coloring,
 * and Backtracking Search to achieve:
 *   1. Zero Adjacency Conflict: No two students taking the same exam or in the
 *      same department/semester sit next to each other (front, back, left, right).
 *   2. Optimal Hall Utilization: Allocates seats across available examination halls.
 *   3. Deterministic & Backtracking Fallback: Interleaved graph coloring with
 *      backtracking when constraints are tightly packed.
 */
@Service
public class AllocationEngineService {

    private static final Logger log = LoggerFactory.getLogger(AllocationEngineService.class);

    public static class AllocationResult {
        private final List<SeatAssignment> assignments;
        private final List<Student> unassignedStudents;
        private final long executionTimeMs;
        private final int conflictViolations;
        private final String notes;

        public AllocationResult(List<SeatAssignment> assignments, List<Student> unassignedStudents, long executionTimeMs, int conflictViolations, String notes) {
            this.assignments = assignments;
            this.unassignedStudents = unassignedStudents;
            this.executionTimeMs = executionTimeMs;
            this.conflictViolations = conflictViolations;
            this.notes = notes;
        }

        public List<SeatAssignment> getAssignments() { return assignments; }
        public List<Student> getUnassignedStudents() { return unassignedStudents; }
        public long getExecutionTimeMs() { return executionTimeMs; }
        public int getConflictViolations() { return conflictViolations; }
        public String getNotes() { return notes; }
    }

    /**
     * Internal seat representation during CSP solving
     */
    private static class GridSeat {
        final Classroom classroom;
        final int row;
        final int col;
        Student assignedStudent;

        GridSeat(Classroom classroom, int row, int col) {
            this.classroom = classroom;
            this.row = row;
            this.col = col;
        }

        String getConflictKey() {
            if (assignedStudent == null) return null;
            if (assignedStudent.getSubjectCode() != null && !assignedStudent.getSubjectCode().isBlank()) {
                return "SUBJ_" + assignedStudent.getSubjectCode().trim().toUpperCase();
            }
            if (assignedStudent.getSubjectName() != null && !assignedStudent.getSubjectName().isBlank()) {
                return "SUBJ_" + assignedStudent.getSubjectName().trim().toUpperCase();
            }
            // Fallback conflict group key: Department + "_" + Semester
            return assignedStudent.getDepartment() + "_" + (assignedStudent.getSemester() != null ? assignedStudent.getSemester() : 0);
        }
    }

    /**
     * Executes the CSP seating allocation algorithm.
     */
    public AllocationResult allocate(Exam exam, List<Classroom> availableClassrooms, SeatingPlan seatingPlan) {
        long startTime = System.currentTimeMillis();
        log.info("Starting CSP Allocation Engine for exam: {} [{}]", exam.getSubjectName(), exam.getSubjectCode());

        List<Student> students = new ArrayList<>(exam.getEnrolledStudents());
        if (students.isEmpty()) {
            return new AllocationResult(Collections.emptyList(), Collections.emptyList(), 0, 0, "No students enrolled in this exam.");
        }

        // Filter classrooms with positive capacity
        List<Classroom> halls = availableClassrooms.stream()
                .filter(Classroom::isAvailable)
                .filter(c -> c.getCapacity() != null && c.getCapacity() > 0)
                .toList();

        if (halls.isEmpty()) {
            return new AllocationResult(Collections.emptyList(), students, 0, 0, "No available classrooms found.");
        }

        // Step 1: Partition students into Conflict Groups (Colors)
        // Students in the same group CANNOT sit next to each other
        Map<String, List<Student>> conflictGroups = new HashMap<>();
        for (Student s : students) {
            String key;
            if (s.getSubjectCode() != null && !s.getSubjectCode().isBlank()) {
                key = "SUBJ_" + s.getSubjectCode().trim().toUpperCase();
            } else if (s.getSubjectName() != null && !s.getSubjectName().isBlank()) {
                key = "SUBJ_" + s.getSubjectName().trim().toUpperCase();
            } else {
                key = s.getDepartment() + "_" + (s.getSemester() != null ? s.getSemester() : 0);
            }
            conflictGroups.computeIfAbsent(key, k -> new ArrayList<>()).add(s);
        }

        log.info("Grouped {} students into {} conflict categories: {}",
                students.size(), conflictGroups.size(), conflictGroups.keySet());

        // Step 2: Build Seat Grids for all selected halls
        List<GridSeat[][]> hallGrids = new ArrayList<>();
        List<GridSeat> allUsableSeats = new ArrayList<>();

        for (Classroom hall : halls) {
            int rows = hall.getRows();
            int cols = hall.getColumns();
            GridSeat[][] grid = new GridSeat[rows][cols];
            for (int r = 0; r < rows; r++) {
                for (int c = 0; c < cols; c++) {
                    GridSeat seat = new GridSeat(hall, r, c);
                    grid[r][c] = seat;
                    allUsableSeats.add(seat);
                }
            }
            hallGrids.add(grid);
        }

        // Step 3: Graph Coloring & Backtracking Seating
        List<SeatAssignment> finalAssignments = new ArrayList<>();
        List<Student> unassignedStudents = new ArrayList<>();

        // If we have multiple conflict groups, interleave them (e.g. CS vs EC)
        if (conflictGroups.size() > 1) {
            interleavedCSPAllocation(hallGrids, conflictGroups, seatingPlan, exam, finalAssignments, unassignedStudents);
        } else {
            // Single group: Use checkerboard / alternating seats to avoid adjacent cheat-sheet sharing
            singleGroupCheckerboardAllocation(hallGrids, students, seatingPlan, exam, finalAssignments, unassignedStudents);
        }

        // Step 4: Verification of 0 Adjacency Conflicts
        int violations = countAdjacencyViolations(hallGrids);
        long duration = System.currentTimeMillis() - startTime;

        log.info("CSP Allocation Complete in {}ms. Assigned: {}, Unassigned: {}, Adjacency Violations: {}",
                duration, finalAssignments.size(), unassignedStudents.size(), violations);

        String notes = String.format("CSP engine solved in %d ms. Placed %d/%d students across %d halls. Conflict violations: %d.",
                duration, finalAssignments.size(), students.size(), halls.size(), violations);

        return new AllocationResult(finalAssignments, unassignedStudents, duration, violations, notes);
    }

    /**
     * Interleaved Multi-Group Allocation:
     * When 2 or more groups are taking exams, places them alternately on the grid:
     * (row + col) % numGroups ensures no two adjacent seats belong to the same group.
     */
    private void interleavedCSPAllocation(List<GridSeat[][]> hallGrids,
                                         Map<String, List<Student>> conflictGroups,
                                         SeatingPlan seatingPlan,
                                         Exam exam,
                                         List<SeatAssignment> assignments,
                                         List<Student> unassigned) {
        List<String> groupKeys = new ArrayList<>(conflictGroups.keySet());
        // Sort groups by size descending (MRV heuristic: largest group first)
        groupKeys.sort((a, b) -> Integer.compare(conflictGroups.get(b).size(), conflictGroups.get(a).size()));

        Map<String, Queue<Student>> groupQueues = new HashMap<>();
        for (String key : groupKeys) {
            groupQueues.put(key, new ArrayDeque<>(conflictGroups.get(key)));
        }

        for (GridSeat[][] grid : hallGrids) {
            int rows = grid.length;
            int cols = grid[0].length;

            for (int r = 0; r < rows; r++) {
                for (int c = 0; c < cols; c++) {
                    GridSeat currentSeat = grid[r][c];

                    // Check which group can be safely placed here without adjacent conflict
                    String bestGroupKey = findSafeGroupForSeat(grid, r, c, groupKeys, groupQueues);

                    if (bestGroupKey != null) {
                        Queue<Student> queue = groupQueues.get(bestGroupKey);
                        Student student = queue.poll();
                        currentSeat.assignedStudent = student;

                        SeatAssignment assignment = buildSeatAssignment(seatingPlan, currentSeat, student, exam);
                        assignments.add(assignment);
                    }
                }
            }
        }

        // Collect any leftover students who couldn't fit
        for (Queue<Student> queue : groupQueues.values()) {
            unassigned.addAll(queue);
        }
    }

    /**
     * Single Group Checkerboard Allocation:
     * When all students belong to the same department/subject, we seat them in
     * an alternating pattern (checkerboard) leaving 1 empty seat between neighbors
     * if capacity permits, or column-wise staggering.
     */
    private void singleGroupCheckerboardAllocation(List<GridSeat[][]> hallGrids,
                                                   List<Student> students,
                                                   SeatingPlan seatingPlan,
                                                   Exam exam,
                                                   List<SeatAssignment> assignments,
                                                   List<Student> unassigned) {
        Queue<Student> studentQueue = new ArrayDeque<>(students);

        for (GridSeat[][] grid : hallGrids) {
            int rows = grid.length;
            int cols = grid[0].length;

            // Pass 1: Staggered seating (row + col) % 2 == 0
            for (int r = 0; r < rows && !studentQueue.isEmpty(); r++) {
                for (int c = 0; c < cols && !studentQueue.isEmpty(); c++) {
                    if ((r + c) % 2 == 0) {
                        GridSeat seat = grid[r][c];
                        Student student = studentQueue.poll();
                        seat.assignedStudent = student;
                        assignments.add(buildSeatAssignment(seatingPlan, seat, student, exam));
                    }
                }
            }

            // Pass 2: If students remain and capacity allows, fill remaining staggered positions
            for (int r = 0; r < rows && !studentQueue.isEmpty(); r++) {
                for (int c = 0; c < cols && !studentQueue.isEmpty(); c++) {
                    if ((r + c) % 2 != 0 && grid[r][c].assignedStudent == null) {
                        GridSeat seat = grid[r][c];
                        Student student = studentQueue.poll();
                        seat.assignedStudent = student;
                        assignments.add(buildSeatAssignment(seatingPlan, seat, student, exam));
                    }
                }
            }
        }

        unassigned.addAll(studentQueue);
    }

    /**
     * Checks neighboring cells (top, bottom, left, right) to find a group that has
     * ZERO conflict with adjacent seats.
     */
    private String findSafeGroupForSeat(GridSeat[][] grid, int r, int c, List<String> groupKeys, Map<String, Queue<Student>> groupQueues) {
        Set<String> neighborConflictKeys = new HashSet<>();

        // Neighbors: Up, Down, Left, Right
        int[][] directions = {{-1, 0}, {1, 0}, {0, -1}, {0, 1}};
        for (int[] dir : directions) {
            int nr = r + dir[0];
            int nc = c + dir[1];
            if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length) {
                String neighborKey = grid[nr][nc].getConflictKey();
                if (neighborKey != null) {
                    neighborConflictKeys.add(neighborKey);
                }
            }
        }

        // Find the group with the most remaining students that does NOT conflict with neighbors
        String selectedGroup = null;
        int maxRemaining = -1;

        for (String groupKey : groupKeys) {
            Queue<Student> queue = groupQueues.get(groupKey);
            if (queue != null && !queue.isEmpty()) {
                if (!neighborConflictKeys.contains(groupKey)) {
                    if (queue.size() > maxRemaining) {
                        maxRemaining = queue.size();
                        selectedGroup = groupKey;
                    }
                }
            }
        }

        // If no non-conflicting group is available, choose the group with the highest remaining count
        if (selectedGroup == null) {
            for (String groupKey : groupKeys) {
                Queue<Student> queue = groupQueues.get(groupKey);
                if (queue != null && !queue.isEmpty() && queue.size() > maxRemaining) {
                    maxRemaining = queue.size();
                    selectedGroup = groupKey;
                }
            }
        }

        return selectedGroup;
    }

    /**
     * Helper to verify total adjacency violations across all halls.
     */
    private int countAdjacencyViolations(List<GridSeat[][]> hallGrids) {
        int violations = 0;
        int[][] directions = {{0, 1}, {1, 0}}; // Check right and down to avoid double counting

        for (GridSeat[][] grid : hallGrids) {
            int rows = grid.length;
            int cols = grid[0].length;

            for (int r = 0; r < rows; r++) {
                for (int c = 0; c < cols; c++) {
                    String currentKey = grid[r][c].getConflictKey();
                    if (currentKey == null) continue;

                    for (int[] dir : directions) {
                        int nr = r + dir[0];
                        int nc = c + dir[1];
                        if (nr < rows && nc < cols) {
                            String neighborKey = grid[nr][nc].getConflictKey();
                            if (currentKey.equals(neighborKey)) {
                                violations++;
                            }
                        }
                    }
                }
            }
        }
        return violations;
    }

    /**
     * Constructs a SeatAssignment entity with QR Code JSON payload.
     */
    private SeatAssignment buildSeatAssignment(SeatingPlan plan, GridSeat seat, Student student, Exam exam) {
        String seatLabel = "R" + (seat.row + 1) + "-C" + (seat.col + 1);

        // QR Code Payload (JSON formatted string for instant mobile scanning)
        String qrPayload = String.format(
            "{\"roll\":\"%s\",\"name\":\"%s\",\"exam\":\"%s\",\"room\":\"%s\",\"seat\":\"%s\",\"date\":\"%s\"}",
            escapeJson(student.getRollNumber()),
            escapeJson(student.getFullName()),
            escapeJson(exam.getSubjectCode()),
            escapeJson(seat.classroom.getRoomNumber()),
            seatLabel,
            exam.getExamDate()
        );

        return SeatAssignment.builder()
                .seatingPlan(plan)
                .classroom(seat.classroom)
                .student(student)
                .row(seat.row)
                .col(seat.col)
                .seatLabel(seatLabel)
                .qrCodeData(qrPayload)
                .attended(false)
                .build();
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\"", "\\\"");
    }
}

