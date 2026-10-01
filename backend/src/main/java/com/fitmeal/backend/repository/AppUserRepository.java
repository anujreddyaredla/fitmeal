package com.fitmeal.backend.repository;

import com.fitmeal.backend.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {

    Optional<AppUser> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    Optional<AppUser> findByVerificationToken(String verificationToken);

    Optional<AppUser> findByResetPasswordToken(String resetPasswordToken);
}
