package com.examseatx.repository;

import com.examseatx.model.SeatingPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SeatingPlanRepository extends JpaRepository<SeatingPlan, Long> {

    List<SeatingPlan> findByExamId(Long examId);

    // Get the currently active plan for an exam
    Optional<SeatingPlan> findByExamIdAndActiveTrue(Long examId);

    List<SeatingPlan> findByStatus(SeatingPlan.PlanStatus status);
}
