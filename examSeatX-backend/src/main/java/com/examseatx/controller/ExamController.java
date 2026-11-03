package com.examseatx.controller;

import com.examseatx.dto.SeatingAllocationResponse;
import com.examseatx.model.Exam;
import com.examseatx.model.SeatingPlan;
import com.examseatx.repository.ExamRepository;
import com.examseatx.service.PdfReportService;
import com.examseatx.service.SeatingService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/exams")
@CrossOrigin(origins = "*")
public class ExamController {

    private final ExamRepository examRepository;
    private final SeatingService seatingService;
    private final PdfReportService pdfReportService;

    public ExamController(ExamRepository examRepository,
                          SeatingService seatingService,
                          PdfReportService pdfReportService) {
        this.examRepository = examRepository;
        this.seatingService = seatingService;
        this.pdfReportService = pdfReportService;
    }

    @GetMapping
    public List<Exam> getAll() {
        return examRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Exam> getOne(@PathVariable Long id) {
        return examRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/count")
    public Map<String, Long> count() {
        return Map.of("count", examRepository.count());
    }

    @PostMapping
    public Exam create(@RequestBody Exam exam) {
        return examRepository.save(exam);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Exam> update(@PathVariable Long id, @RequestBody Exam updated) {
        return examRepository.findById(id).map(existing -> {
            existing.setSubjectName(updated.getSubjectName());
            existing.setSubjectCode(updated.getSubjectCode());
            existing.setExamDate(updated.getExamDate());
            existing.setStartTime(updated.getStartTime());
            existing.setEndTime(updated.getEndTime());
            existing.setDepartment(updated.getDepartment());
            existing.setSemester(updated.getSemester());
            existing.setStatus(updated.getStatus());
            return ResponseEntity.ok(examRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        examRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Trigger CSP Allocation Engine for this exam.
     */
    @PostMapping("/{id}/generate-seating")
    public ResponseEntity<SeatingAllocationResponse> generateSeating(@PathVariable Long id) {
        SeatingAllocationResponse response = seatingService.generateSeatingPlan(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Get the active seating plan for this exam.
     */
    @GetMapping("/{id}/seating-plan")
    public ResponseEntity<SeatingAllocationResponse> getSeatingPlan(@PathVariable Long id) {
        return seatingService.getActivePlanDTO(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Export attendance & seating chart as PDF.
     */
    @GetMapping("/{id}/seating-plan/pdf")
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found with id: " + id));

        SeatingPlan plan = seatingService.getActivePlanForExam(id)
                .orElseThrow(() -> new IllegalStateException("No active seating plan found for this exam. Generate seating first."));

        try {
            byte[] pdfBytes = pdfReportService.generateSeatingPdf(exam, plan);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"SeatingChart_" + exam.getSubjectCode() + ".pdf\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(pdfBytes);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
