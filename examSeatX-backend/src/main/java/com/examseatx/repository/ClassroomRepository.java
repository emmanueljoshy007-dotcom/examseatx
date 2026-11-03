package com.examseatx.repository;

import com.examseatx.model.Classroom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ClassroomRepository extends JpaRepository<Classroom, Long> {

    Optional<Classroom> findByRoomNumber(String roomNumber);

    boolean existsByRoomNumber(String roomNumber);

    List<Classroom> findByAvailableTrue();

    List<Classroom> findByBuilding(String building);

    // Find classrooms that can fit at least N students
    List<Classroom> findByCapacityGreaterThanEqual(Integer minCapacity);

    // Get total seat capacity across all available rooms
    @Query("SELECT SUM(c.capacity) FROM Classroom c WHERE c.available = true")
    Long totalAvailableCapacity();
}
