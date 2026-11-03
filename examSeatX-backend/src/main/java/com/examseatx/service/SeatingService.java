package com.examseatx.service;

import com.examseatx.dto.SeatingAllocationResponse;
import com.examseatx.dto.StudentLookupDTO;
import com.examseatx.model.*;
import com.examseatx.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class SeatingService {

    private static final Logger log = LoggerFactory.getLogger(SeatingService.class);

    private final ExamRepository examRepository;
    private final ClassroomRepository classroomRepository;
    private final SeatingPlanRepository seatingPlanRepository;
    private final SeatAssignmentRepository seatAssignmentRepository;
    private final StudentRepository studentRepository;
    private final AllocationEngineService allocationEngineService;

    public SeatingService(ExamRepository examRepository,
                          ClassroomRepository classroomRepository,
                          SeatingPlanRepository seatingPlanRepository,
                          SeatAssignmentRepository seatAssignmentRepository,
                          StudentRepository studentRepository,
                          AllocationEngineService allocationEngineService) {
        this.examRepository = examRepository;
        this.classroomRepository = classroomRepository;
        this.seatingPlanRepository = seatingPlanRepository;
        this.seatAssignmentRepository = seatAssignmentRepository;
        this.studentRepository = studentRepository;
        this.allocationEngineService = allocationEngineService;
    }

    /**
     * Triggers the CSP engine and persists the resulting seating plan.
     */
    @Transactional
    public SeatingAllocationResponse generateSeatingPlan(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found with id: " + examId));

        // Auto-enroll eligible students if none explicitly enrolled yet
        if (exam.getEnrolledStudents() == null || exam.getEnrolledStudents().isEmpty()) {
            List<Student> eligibleStudents = new ArrayList<>();
            // First priority: Match by Subject Code or Subject Name (Elective support)
            if (exam.getSubjectCode() != null && !exam.getSubjectCode().isBlank()) {
                eligibleStudents = studentRepository.findBySubjectCodeIgnoreCase(exam.getSubjectCode().trim());
            }
            if (eligibleStudents.isEmpty() && exam.getSubjectName() != null && !exam.getSubjectName().isBlank()) {
                eligibleStudents = studentRepository.findBySubjectNameIgnoreCase(exam.getSubjectName().trim());
            }
            // Second priority: Department and Semester
            if (eligibleStudents.isEmpty()) {
                if (exam.getDepartment() != null && !exam.getDepartment().isBlank() && !"All Departments".equalsIgnoreCase(exam.getDepartment())) {
                    if (exam.getSemester() != null) {
                        eligibleStudents = studentRepository.findByDepartmentAndSemester(exam.getDepartment(), exam.getSemester());
                    }
                    if (eligibleStudents.isEmpty()) {
                        eligibleStudents = studentRepository.findByDepartment(exam.getDepartment());
                    }
                }
            }
            // Fallback: All active students
            if (eligibleStudents.isEmpty()) {
                eligibleStudents = studentRepository.findAll();
            }
            if (!eligibleStudents.isEmpty()) {
                exam.setEnrolledStudents(eligibleStudents);
                exam = examRepository.save(exam);
            }
        }

        // Archive/Deactivate any previous active plan for this exam
        Optional<SeatingPlan> previousPlan = seatingPlanRepository.findByExamIdAndActiveTrue(examId);
        previousPlan.ifPresent(p -> {
            p.setActive(false);
            p.setStatus(SeatingPlan.PlanStatus.ARCHIVED);
            seatingPlanRepository.save(p);
        });

        // Initialize new SeatingPlan
        SeatingPlan newPlan = SeatingPlan.builder()
                .exam(exam)
                .status(SeatingPlan.PlanStatus.GENERATING)
                .active(true)
                .build();
        newPlan = seatingPlanRepository.save(newPlan);

        // Fetch all usable classrooms
        List<Classroom> classrooms = classroomRepository.findByAvailableTrue();
        if (classrooms.isEmpty()) {
            newPlan.setStatus(SeatingPlan.PlanStatus.FAILED);
            newPlan.setEngineNotes("No available classrooms found to allocate seats.");
            seatingPlanRepository.save(newPlan);
            throw new IllegalStateException("No classrooms are marked as available for examinations.");
        }

        // Run the Constraint Allocation Engine
        AllocationEngineService.AllocationResult result = allocationEngineService.allocate(exam, classrooms, newPlan);

        // Persist all generated seat assignments
        List<SeatAssignment> savedAssignments = seatAssignmentRepository.saveAll(result.getAssignments());

        // Update plan summary
        newPlan.setAssignments(savedAssignments);
        newPlan.setAssignedCount(savedAssignments.size());
        newPlan.setUnassignedCount(result.getUnassignedStudents().size());
        newPlan.setGenerationTimeMs(result.getExecutionTimeMs());
        newPlan.setEngineNotes(result.getNotes());
        newPlan.setStatus(SeatingPlan.PlanStatus.SUCCESS);
        seatingPlanRepository.save(newPlan);

        // Update exam status
        exam.setStatus(Exam.ExamStatus.SEATING_GENERATED);
        examRepository.save(exam);

        log.info("Saved seating plan #{} for exam {}. Total assigned: {}", newPlan.getId(), exam.getSubjectCode(), savedAssignments.size());

        return mapToResponseDTO(newPlan, exam, savedAssignments, result.getNotes());
    }

    /**
     * Retrieves the active seating plan DTO for an exam (avoids Hibernate ByteBuddy proxy serialization issues).
     */
    @Transactional(readOnly = true)
    public Optional<SeatingAllocationResponse> getActivePlanDTO(Long examId) {
        Optional<SeatingPlan> planOpt = seatingPlanRepository.findByExamIdAndActiveTrue(examId);
        if (planOpt.isEmpty()) {
            return Optional.empty();
        }

        SeatingPlan plan = planOpt.get();
        Exam exam = plan.getExam();
        List<SeatAssignment> assignments = seatAssignmentRepository.findBySeatingPlanId(plan.getId());

        return Optional.of(mapToResponseDTO(plan, exam, assignments, plan.getEngineNotes()));
    }

    private SeatingAllocationResponse mapToResponseDTO(SeatingPlan plan, Exam exam, List<SeatAssignment> assignments, String notes) {
        List<SeatingAllocationResponse.SeatAssignmentDTO> assignmentDTOs = new ArrayList<>();
        for (SeatAssignment sa : assignments) {
            assignmentDTOs.add(new SeatingAllocationResponse.SeatAssignmentDTO(
                    sa.getId(),
                    sa.getStudent().getRollNumber(),
                    sa.getStudent().getFullName(),
                    sa.getStudent().getDepartment(),
                    sa.getClassroom().getRoomNumber(),
                    sa.getClassroom().getBuilding(),
                    sa.getRow(),
                    sa.getCol(),
                    sa.getSeatLabel(),
                    sa.getQrCodeData()
            ));
        }

        return new SeatingAllocationResponse(
                plan.getId(),
                exam.getId(),
                exam.getSubjectName(),
                exam.getSubjectCode(),
                exam.getExamDate(),
                exam.getStartTime(),
                plan.getAssignedCount() != null ? plan.getAssignedCount() : assignmentDTOs.size(),
                plan.getUnassignedCount() != null ? plan.getUnassignedCount() : 0,
                plan.getGenerationTimeMs() != null ? plan.getGenerationTimeMs() : 0L,
                plan.getStatus().name(),
                notes,
                assignmentDTOs
        );
    }

    /**
     * Looks up active seat assignments for a student by their Roll Number.
     */
    @Transactional(readOnly = true)
    public List<StudentLookupDTO> lookupSeatByRollNumber(String rollNumber) {
        List<SeatAssignment> assignments = seatAssignmentRepository.findByStudentRollNumber(rollNumber.trim().toUpperCase());
        List<StudentLookupDTO> results = new ArrayList<>();

        for (SeatAssignment sa : assignments) {
            if (sa.getSeatingPlan() != null && sa.getSeatingPlan().isActive()) {
                Exam exam = sa.getSeatingPlan().getExam();
                String subjName = (sa.getStudent().getSubjectName() != null && !sa.getStudent().getSubjectName().isBlank())
                        ? sa.getStudent().getSubjectName()
                        : exam.getSubjectName();
                String subjCode = (sa.getStudent().getSubjectCode() != null && !sa.getStudent().getSubjectCode().isBlank())
                        ? sa.getStudent().getSubjectCode()
                        : exam.getSubjectCode();
                results.add(new StudentLookupDTO(
                        sa.getStudent().getRollNumber(),
                        sa.getStudent().getFullName(),
                        sa.getStudent().getDepartment(),
                        subjName,
                        subjCode,
                        exam.getExamDate(),
                        exam.getStartTime(),
                        exam.getEndTime(),
                        sa.getClassroom().getRoomNumber(),
                        sa.getClassroom().getBuilding(),
                        sa.getClassroom().getFloor(),
                        sa.getRow(),
                        sa.getCol(),
                        sa.getSeatLabel(),
                        sa.getQrCodeData()
                ));
            }
        }
        return results;
    }

    /**
     * Retrieves the raw active seating plan entity for internal/PDF services.
     */
    @Transactional(readOnly = true)
    public Optional<SeatingPlan> getActivePlanForExam(Long examId) {
        return seatingPlanRepository.findByExamIdAndActiveTrue(examId);
    }

    /**
     * Marks student attendance.
     */
    @Transactional
    public boolean markAttendance(Long seatAssignmentId, boolean attended) {
        return seatAssignmentRepository.findById(seatAssignmentId).map(sa -> {
            sa.setAttended(attended);
            seatAssignmentRepository.save(sa);
            return true;
        }).orElse(false);
    }
}
