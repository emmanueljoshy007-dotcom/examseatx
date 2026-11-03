package com.examseatx.repository;

import com.examseatx.model.Exam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {

    List<Exam> findByExamDate(LocalDate date);

    List<Exam> findByDepartmentAndSemester(String department, Integer semester);

    List<Exam> findByStatus(Exam.ExamStatus status);

    List<Exam> findByAcademicYear(String academicYear);

    // Find exams happening in a date range
    List<Exam> findByExamDateBetween(LocalDate startDate, LocalDate endDate);

    // Count students enrolled in an exam
    @Query("SELECT COUNT(s) FROM Exam e JOIN e.enrolledStudents s WHERE e.id = :examId")
    Long countEnrolledStudents(Long examId);
}
