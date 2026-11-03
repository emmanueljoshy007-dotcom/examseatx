package com.examseatx.controller;

import com.examseatx.model.Student;
import com.examseatx.repository.StudentRepository;
import org.apache.poi.ss.usermodel.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")
public class StudentController {

    private static final Logger log = LoggerFactory.getLogger(StudentController.class);
    private final StudentRepository studentRepository;

    public StudentController(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @GetMapping
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudent(@PathVariable Long id) {
        return studentRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/roll/{rollNumber}")
    public ResponseEntity<Student> getByRoll(@PathVariable String rollNumber) {
        return studentRepository.findByRollNumber(rollNumber)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/count")
    public Map<String, Long> count() {
        return Map.of("count", studentRepository.count());
    }

    @PostMapping
    public Student createStudent(@RequestBody Student student) {
        return studentRepository.save(student);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id, @RequestBody Student updated) {
        return studentRepository.findById(id).map(existing -> {
            existing.setFirstName(updated.getFirstName());
            existing.setLastName(updated.getLastName());
            existing.setEmail(updated.getEmail());
            existing.setDepartment(updated.getDepartment());
            existing.setSemester(updated.getSemester());
            existing.setAcademicYear(updated.getAcademicYear());
            existing.setProgram(updated.getProgram());
            existing.setSubjectCode(updated.getSubjectCode());
            existing.setSubjectName(updated.getSubjectName());
            existing.setActive(updated.isActive());
            return ResponseEntity.ok(studentRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Resilient Student Bulk Upload.
     * Supports both Excel (.xlsx, .xls) and CSV (.csv) formats with 2 to 8 columns:
     * - rollNumber, name
     * - rollNumber, firstName, lastName
     * - rollNumber, firstName, lastName, email, department, semester, academicYear, program
     */
    @PostMapping(value = "/upload-csv", consumes = {"multipart/form-data"})
    public ResponseEntity<Map<String, Object>> uploadStudentsCsv(@RequestParam("file") MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "The uploaded file is empty. Please select a valid Excel (.xlsx/.xls) or .csv file."
            ));
        }

        List<Student> studentsToSave = new ArrayList<>();
        int skippedDuplicates = 0;
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename().toLowerCase() : "";
        List<String[]> dataRows = new ArrayList<>();

        try {
            if (originalFilename.endsWith(".xlsx") || originalFilename.endsWith(".xls")) {
                // Parse Excel spreadsheet
                try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
                    Sheet sheet = workbook.getSheetAt(0);
                    DataFormatter formatter = new DataFormatter();
                    for (Row row : sheet) {
                        if (row == null) continue;
                        int lastCol = Math.max(row.getLastCellNum(), 8);
                        String[] tokens = new String[lastCol];
                        boolean hasData = false;
                        for (int cn = 0; cn < lastCol; cn++) {
                            Cell cell = row.getCell(cn, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL);
                            tokens[cn] = cell != null ? formatter.formatCellValue(cell).trim() : "";
                            if (!tokens[cn].isEmpty()) hasData = true;
                        }
                        if (hasData) {
                            dataRows.add(tokens);
                        }
                    }
                }
            } else {
                // Parse CSV / TXT
                try (BufferedReader reader = new BufferedReader(
                        new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
                    String rawLine;
                    int lineNumber = 0;
                    while ((rawLine = reader.readLine()) != null) {
                        lineNumber++;
                        String line = rawLine.trim();
                        if (lineNumber == 1 && line.startsWith("\uFEFF")) {
                            line = line.substring(1).trim();
                        }
                        if (line.isEmpty() || line.startsWith("#")) continue;

                        String delimiter = line.contains(",") ? "," : (line.contains(";") ? ";" : "\t");
                        String[] tokens = line.split(delimiter, -1);
                        for (int i = 0; i < tokens.length; i++) {
                            tokens[i] = tokens[i].trim().replace("\"", "");
                        }
                        dataRows.add(tokens);
                    }
                }
            }

            int rollCol = 0, nameCol = 1, emailCol = -1, deptCol = -1, semCol = -1, acadCol = -1, progCol = -1, subjCodeCol = -1, subjNameCol = -1;
            boolean hasHeader = false;

            if (!dataRows.isEmpty()) {
                String[] header = dataRows.get(0);
                boolean matchesHeader = false;
                for (int i = 0; i < header.length; i++) {
                    String h = header[i].trim().toLowerCase().replaceAll("[^a-z0-9]", "");
                    if (h.contains("roll") || h.contains("reg") || h.contains("studentid")) {
                        rollCol = i;
                        matchesHeader = true;
                    } else if (h.equals("name") || h.contains("studentname") || h.equals("firstname")) {
                        nameCol = i;
                        matchesHeader = true;
                    } else if (h.contains("mail")) {
                        emailCol = i;
                    } else if (h.contains("dept") || h.contains("branch") || h.contains("department")) {
                        deptCol = i;
                        matchesHeader = true;
                    } else if (h.contains("sem")) {
                        semCol = i;
                    } else if (h.contains("year") || h.contains("batch")) {
                        acadCol = i;
                    } else if (h.contains("prog")) {
                        progCol = i;
                    } else if (h.contains("subcode") || h.contains("subjectcode") || h.contains("coursecode")) {
                        subjCodeCol = i;
                        matchesHeader = true;
                    } else if (h.contains("subject") || h.contains("course") || h.contains("elective") || h.contains("paper")) {
                        subjNameCol = i;
                        matchesHeader = true;
                    }
                }
                if (matchesHeader) {
                    hasHeader = true;
                }
            }

            int startIndex = hasHeader ? 1 : 0;
            for (int r = startIndex; r < dataRows.size(); r++) {
                String[] tokens = dataRows.get(r);
                if (tokens.length == 0) continue;

                String roll = (rollCol < tokens.length) ? tokens[rollCol].trim() : "";
                if (roll.isEmpty()) continue;

                // Skip header row if somehow repeated
                String lowerRoll = roll.toLowerCase();
                if (lowerRoll.contains("roll") || lowerRoll.contains("id") || lowerRoll.equals("rollnumber") || lowerRoll.equals("student_id")) {
                    continue;
                }

                // Check duplicate roll number
                if (studentRepository.existsByRollNumber(roll)) {
                    skippedDuplicates++;
                    continue;
                }

                String firstName = "Student";
                String lastName = "";
                String email = null;
                String department = "Computer Science";
                Integer semester = 5;
                String academicYear = "2024-25";
                String program = "B.Tech";
                String subjectCode = null;
                String subjectName = null;

                if (hasHeader) {
                    if (nameCol >= 0 && nameCol < tokens.length && !tokens[nameCol].isBlank()) {
                        String[] nameParts = tokens[nameCol].trim().split("\\s+", 2);
                        firstName = nameParts[0];
                        if (nameParts.length > 1) lastName = nameParts[1];
                    }
                    if (emailCol >= 0 && emailCol < tokens.length && !tokens[emailCol].isBlank() && tokens[emailCol].contains("@")) {
                        email = tokens[emailCol].trim();
                    }
                    if (deptCol >= 0 && deptCol < tokens.length && !tokens[deptCol].isBlank()) {
                        department = tokens[deptCol].trim();
                    }
                    if (semCol >= 0 && semCol < tokens.length && !tokens[semCol].isBlank()) {
                        try {
                            semester = Integer.parseInt(tokens[semCol].replaceAll("[^0-9]", ""));
                        } catch (Exception ignored) {}
                    }
                    if (acadCol >= 0 && acadCol < tokens.length && !tokens[acadCol].isBlank()) {
                        academicYear = tokens[acadCol].trim();
                    }
                    if (progCol >= 0 && progCol < tokens.length && !tokens[progCol].isBlank()) {
                        program = tokens[progCol].trim();
                    }
                    if (subjCodeCol >= 0 && subjCodeCol < tokens.length && !tokens[subjCodeCol].isBlank()) {
                        subjectCode = tokens[subjCodeCol].trim();
                    }
                    if (subjNameCol >= 0 && subjNameCol < tokens.length && !tokens[subjNameCol].isBlank()) {
                        subjectName = tokens[subjNameCol].trim();
                    }
                } else {
                    // Positional fallback
                    if (tokens.length >= 2 && !tokens[1].isBlank()) {
                        String[] nameParts = tokens[1].trim().split("\\s+", 2);
                        firstName = nameParts[0];
                        if (nameParts.length > 1) lastName = nameParts[1];
                    }
                    if (tokens.length >= 3 && !tokens[2].isBlank()) {
                        if (tokens[2].contains("@")) {
                            email = tokens[2];
                        } else if (lastName.isEmpty()) {
                            lastName = tokens[2];
                        } else {
                            department = tokens[2];
                        }
                    }
                    if (tokens.length >= 4 && !tokens[3].isBlank()) {
                        if (tokens[3].contains("@")) {
                            email = tokens[3];
                        } else {
                            department = tokens[3];
                        }
                    }
                    if (tokens.length >= 5 && !tokens[4].isBlank()) {
                        department = tokens[4];
                    }
                    if (tokens.length >= 6 && !tokens[5].isBlank()) {
                        try {
                            semester = Integer.parseInt(tokens[5].replaceAll("[^0-9]", ""));
                        } catch (Exception ignored) {}
                    }
                    if (tokens.length >= 7 && !tokens[6].isBlank()) {
                        academicYear = tokens[6];
                    }
                    if (tokens.length >= 8 && !tokens[7].isBlank()) {
                        program = tokens[7];
                    }
                    if (tokens.length >= 9 && !tokens[8].isBlank()) {
                        subjectCode = tokens[8].trim();
                    }
                    if (tokens.length >= 10 && !tokens[9].isBlank()) {
                        subjectName = tokens[9].trim();
                    }
                }

                // If subjectName was provided without subjectCode, or vice versa:
                if (subjectCode != null && subjectName == null) {
                    subjectName = subjectCode;
                } else if (subjectName != null && subjectCode == null) {
                    subjectCode = subjectName;
                }

                // Ensure unique email or set to null
                if (email != null && (email.isBlank() || studentRepository.existsByEmail(email))) {
                    email = null;
                }

                studentsToSave.add(Student.builder()
                        .rollNumber(roll)
                        .firstName(firstName)
                        .lastName(lastName)
                        .email(email)
                        .department(department)
                        .semester(semester)
                        .academicYear(academicYear)
                        .program(program)
                        .subjectCode(subjectCode)
                        .subjectName(subjectName)
                        .active(true)
                        .build());
            }

            if (!studentsToSave.isEmpty()) {
                studentRepository.saveAll(studentsToSave);
            }

            log.info("Uploaded roster processed: {} saved, {} skipped duplicates.", studentsToSave.size(), skippedDuplicates);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "importedCount", studentsToSave.size(),
                    "skippedDuplicates", skippedDuplicates,
                    "message", String.format("Successfully imported %d students (%d duplicate/existing roll numbers skipped).",
                            studentsToSave.size(), skippedDuplicates)
            ));

        } catch (Exception e) {
            log.error("Student roster upload processing failed", e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Failed to parse file: " + e.getMessage()
            ));
        }
    }
}
