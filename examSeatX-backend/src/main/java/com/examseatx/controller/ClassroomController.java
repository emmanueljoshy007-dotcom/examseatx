package com.examseatx.controller;

import com.examseatx.model.Classroom;
import com.examseatx.repository.ClassroomRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/classrooms")
@CrossOrigin(origins = "*")
public class ClassroomController {

    private final ClassroomRepository classroomRepository;

    public ClassroomController(ClassroomRepository classroomRepository) {
        this.classroomRepository = classroomRepository;
    }

    @GetMapping
    public List<Classroom> getAll() {
        return classroomRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Classroom> getOne(@PathVariable Long id) {
        return classroomRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/count")
    public Map<String, Long> count() {
        return Map.of("count", classroomRepository.count());
    }

    @PostMapping
    public Classroom create(@RequestBody Classroom classroom) {
        if (classroom.getBenches() != null && classroom.getBenches() > 0) {
            classroom.setCapacity(classroom.getBenches() * 2);
            if (classroom.getColumns() == null || classroom.getColumns() <= 0) {
                classroom.setColumns(4); // 2 bench columns x 2 seats
            }
            if (classroom.getRows() == null || classroom.getRows() <= 0) {
                int r = (int) Math.ceil((double) classroom.getCapacity() / classroom.getColumns());
                classroom.setRows(Math.max(r, 1));
            }
        } else if (classroom.getCapacity() == null && classroom.getRows() != null && classroom.getColumns() != null) {
            classroom.setCapacity(classroom.getRows() * classroom.getColumns());
            classroom.setBenches(classroom.getCapacity() / 2);
        } else if (classroom.getCapacity() != null && classroom.getBenches() == null) {
            classroom.setBenches(classroom.getCapacity() / 2);
        }
        return classroomRepository.save(classroom);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Classroom> update(@PathVariable Long id, @RequestBody Classroom updated) {
        return classroomRepository.findById(id).map(existing -> {
            existing.setRoomNumber(updated.getRoomNumber());
            existing.setBuilding(updated.getBuilding());
            existing.setFloor(updated.getFloor());
            existing.setBenches(updated.getBenches());
            if (updated.getBenches() != null && updated.getBenches() > 0) {
                existing.setCapacity(updated.getBenches() * 2);
                int cols = (updated.getColumns() != null && updated.getColumns() > 0) ? updated.getColumns() : 4;
                existing.setColumns(cols);
                int r = (int) Math.ceil((double) existing.getCapacity() / cols);
                existing.setRows(Math.max(r, 1));
            } else {
                existing.setRows(updated.getRows());
                existing.setColumns(updated.getColumns());
                existing.setCapacity(updated.getCapacity() != null ? updated.getCapacity() : (updated.getRows() != null && updated.getColumns() != null ? updated.getRows() * updated.getColumns() : 0));
            }
            existing.setAvailable(updated.isAvailable());
            existing.setNotes(updated.getNotes());
            return ResponseEntity.ok(classroomRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        classroomRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

