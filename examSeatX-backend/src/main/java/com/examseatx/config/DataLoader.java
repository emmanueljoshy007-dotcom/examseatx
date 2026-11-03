package com.examseatx.config;

import com.examseatx.model.User;
import com.examseatx.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataLoader {

    private static final Logger log = LoggerFactory.getLogger(DataLoader.class);

    private final UserRepository userRepository;

    public DataLoader(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Bean
    public CommandLineRunner loadInitialAdminUser() {
        return args -> {
            log.info("========================================");
            log.info("  ExamSeatX - Clean Slate Initialized");
            log.info("  No mock data loaded.");
            log.info("  Only user-entered data will be stored.");
            log.info("========================================");

            // Keep default system admin account
            if (userRepository.count() == 0) {
                User admin = User.builder()
                    .username("admin")
                    .password("admin123")
                    .email("admin@examseatx.edu")
                    .fullName("System Administrator")
                    .role(User.Role.SUPER_ADMIN)
                    .build();
                userRepository.save(admin);
            }
        };
    }
}
