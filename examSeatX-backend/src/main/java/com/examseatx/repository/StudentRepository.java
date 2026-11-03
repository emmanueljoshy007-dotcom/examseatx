package com.examseatx.repository;

import com.examseatx.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByRollNumber(String rollNumber);

    boolean existsByRollNumber(String rollNumber);

    boolean existsByEmail(String email);

    List<Student> findByDepartment(String department);

    List<Student> findByDepartmentAndSemester(String department, Integer semester);

    List<Student> findByAcademicYear(String academicYear);

    List<Student> findBySubjectCodeIgnoreCase(String subjectCode);

    List<Student> findBySubjectNameIgnoreCase(String subjectName);

    // Custom JPQL query: find students by name (case-insensitive search)
    @Query("SELECT s FROM Student s WHERE LOWER(s.firstName) LIKE LOWER(CONCAT('%', :name, '%')) OR LOWER(s.lastName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Student> findByNameContaining(String name);

    // Count students per department
    @Query("SELECT s.department, COUNT(s) FROM Student s GROUP BY s.department")
    List<Object[]> countByDepartment();
}
