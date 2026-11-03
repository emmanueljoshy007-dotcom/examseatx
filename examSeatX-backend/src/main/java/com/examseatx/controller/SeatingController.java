package com.examseatx.controller;

import com.examseatx.dto.SeatingAllocationResponse;
import com.examseatx.dto.StudentLookupDTO;
import com.examseatx.model.SeatingPlan;
import com.examseatx.service.SeatingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/seating")
@CrossOrigin(origins = "*")
public class SeatingController {

    private final SeatingService seatingService;

    public SeatingController(SeatingService seatingService) {
        this.seatingService = seatingService;
    }

    /**
     * Trigger the Constraint Satisfaction (CSP) allocation engine for an exam.
     */
    @PostMapping("/allocate/{examId}")
    public ResponseEntity<SeatingAllocationResponse> allocate(@PathVariable Long examId) {
        SeatingAllocationResponse response = seatingService.generateSeatingPlan(examId);
        return ResponseEntity.ok(response);
    }

    /**
     * Mobile-friendly student seat lookup by Roll Number.
     */
    @GetMapping("/lookup/{rollNumber}")
    public ResponseEntity<List<StudentLookupDTO>> lookup(@PathVariable String rollNumber) {
        List<StudentLookupDTO> results = seatingService.lookupSeatByRollNumber(rollNumber);
        if (results.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(results);
    }

    /**
     * Fetch the active seating plan for a given exam.
     */
    @GetMapping("/plan/{examId}")
    public ResponseEntity<SeatingAllocationResponse> getActivePlan(@PathVariable Long examId) {
        return seatingService.getActivePlanDTO(examId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Attendance toggle for invigilators.
     */
    @PostMapping("/attendance/{assignmentId}")
    public ResponseEntity<Map<String, Object>> markAttendance(@PathVariable Long assignmentId,
                                                              @RequestParam(defaultValue = "true") boolean attended) {
        boolean success = seatingService.markAttendance(assignmentId, attended);
        return ResponseEntity.ok(Map.of("success", success, "attended", attended));
    }
}

