package com.examseatx;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * ExamSeatX - Intelligent Constraint-Based Examination Seating System
 *
 * Entry point for the Spring Boot application.
 * The @SpringBootApplication annotation enables:
 *   - @Configuration: This class can define Spring beans
 *   - @EnableAutoConfiguration: Spring Boot auto-configures H2, JPA, Web, etc.
 *   - @ComponentScan: Scans all sub-packages for components, services, controllers
 */
@SpringBootApplication
public class ExamSeatXApplication {
    public static void main(String[] args) {
        SpringApplication.run(ExamSeatXApplication.class, args);
        System.out.println("====================================================");
        System.out.println("  ExamSeatX Backend is RUNNING!");
        System.out.println("  API Base:    http://localhost:8080/api");
        System.out.println("  H2 Console:  http://localhost:8080/h2-console");
        System.out.println("====================================================");
    }
}
