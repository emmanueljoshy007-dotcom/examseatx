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
        if (classroom.getCapacity() == null && classroom.getRows() != null && classroom.getColumns() != null) {
            classroom.setCapacity(classroom.getRows() * classroom.getColumns());
        }
        return classroomRepository.save(classroom);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Classroom> update(@PathVariable Long id, @RequestBody Classroom updated) {
        return classroomRepository.findById(id).map(existing -> {
            existing.setRoomNumber(updated.getRoomNumber());
            existing.setBuilding(updated.getBuilding());
            existing.setFloor(updated.getFloor());
            existing.setRows(updated.getRows());
            existing.setColumns(updated.getColumns());
            existing.setCapacity(updated.getCapacity() != null ? updated.getCapacity() : updated.getRows() * updated.getColumns());
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

