package com.examseatx.repository;

import com.examseatx.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * UserRepository - Data access layer for User entity
 *
 * By extending JpaRepository, we get these methods for FREE:
 * save(), findById(), findAll(), deleteById(), count(), existsById(), etc.
 *
 * We only need to add custom query methods here.
 * Spring Data JPA auto-generates the SQL from method names!
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // SELECT * FROM users WHERE username = ?
    Optional<User> findByUsername(String username);

    // SELECT * FROM users WHERE email = ?
    Optional<User> findByEmail(String email);

    // SELECT EXISTS(SELECT 1 FROM users WHERE username = ?)
    boolean existsByUsername(String username);

    boolean existsByEmail(String email);
}
