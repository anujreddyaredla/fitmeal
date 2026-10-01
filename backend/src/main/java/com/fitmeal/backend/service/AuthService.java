package com.fitmeal.backend.service;

import com.fitmeal.backend.model.AppUser;
import com.fitmeal.backend.model.AuthResponse;
import com.fitmeal.backend.model.ForgotPasswordRequest;
import com.fitmeal.backend.model.LoginRequest;
import com.fitmeal.backend.model.RegisterRequest;
import com.fitmeal.backend.model.ResetPasswordRequest;
import com.fitmeal.backend.repository.AppUserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final AppUserRepository appUserRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            AppUserRepository appUserRepository,
            BCryptPasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        try {
            if (request == null) {
                return new AuthResponse("Invalid registration request", null, null, null, null, null);
            }

            if (isBlank(request.getFirstName())) {
                return new AuthResponse("First name is required", null, null, null, null, null);
            }

            if (isBlank(request.getLastName())) {
                return new AuthResponse("Last name is required", null, null, null, null, null);
            }

            if (isBlank(request.getEmail()) || !request.getEmail().contains("@")) {
                return new AuthResponse("Invalid email", null, null, null, null, null);
            }

            if (isBlank(request.getPassword())) {
                return new AuthResponse("Password is required", null, null, null, null, null);
            }

            if (!request.getPassword().equals(request.getConfirmPassword())) {
                return new AuthResponse("Passwords do not match", null, null, null, null, null);
            }

            String email = request.getEmail().trim().toLowerCase();

            if (appUserRepository.existsByEmailIgnoreCase(email)) {
                return new AuthResponse("Email already exists", null, email, null, null, null);
            }

            AppUser user = new AppUser();
            user.setFirstName(request.getFirstName().trim());
            user.setLastName(request.getLastName().trim());
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setRole("USER");
            // TODO: In production, require email verification before allowing login. Local development auto-verifies users.
            user.setEmailVerified(true);
            user.setVerificationToken(null);

            AppUser savedUser = appUserRepository.save(user);

            return new AuthResponse(
                    "Registration successful. You can now login.",
                    null,
                    savedUser.getEmail(),
                    savedUser.getFirstName(),
                    savedUser.getLastName(),
                    savedUser.getRole()
            );
        } catch (Exception exception) {
            return new AuthResponse("Internal server error", null, null, null, null, null);
        }
    }

    public AuthResponse login(LoginRequest request) {
        try {
            if (request == null) {
                return new AuthResponse("Invalid login request", null, null, null, null, null);
            }

            if (isBlank(request.getUsernameOrPhone())) {
                return new AuthResponse("Invalid email", null, null, null, null, null);
            }

            if (isBlank(request.getPassword())) {
                return new AuthResponse("Password is required", null, null, null, null, null);
            }

            String email = request.getUsernameOrPhone().trim().toLowerCase();

            AppUser user = appUserRepository.findByEmailIgnoreCase(email).orElse(null);

            if (user == null) {
                return new AuthResponse("User not found", null, null, null, null, null);
            }

            if (!user.isEmailVerified()) {
                return new AuthResponse("Please verify your email before logging in", null, user.getEmail(), null, null, null);
            }

            boolean passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPassword());

            if (!passwordMatches) {
                return new AuthResponse("Invalid password", null, user.getEmail(), null, null, null);
            }

            if (isBlank(user.getRole())) {
                user.setRole("USER");
                user = appUserRepository.save(user);
            }

            String token = jwtService.generateToken(user);

            return new AuthResponse(
                    "Login successful",
                    token,
                    user.getEmail(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getRole()
            );
        } catch (IllegalArgumentException exception) {
            return new AuthResponse("Invalid password", null, null, null, null, null);
        } catch (Exception exception) {
            return new AuthResponse("Internal server error", null, null, null, null, null);
        }
    }

    public AuthResponse verifyEmail(String token) {
        if (isBlank(token)) {
            return new AuthResponse("Invalid verification token", null, null, null, null, null);
        }

        AppUser user = appUserRepository.findByVerificationToken(token).orElse(null);

        if (user == null) {
            return new AuthResponse("Invalid verification token", null, null, null, null, null);
        }

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        AppUser savedUser = appUserRepository.save(user);

        return new AuthResponse(
                "Email verified successfully. You can now login.",
                null,
                savedUser.getEmail(),
                savedUser.getFirstName(),
                savedUser.getLastName(),
                savedUser.getRole()
        );
    }

    public AuthResponse forgotPassword(ForgotPasswordRequest request) {
        String genericMessage = "If this email exists, reset instructions have been sent.";

        if (request == null || isBlank(request.getEmail())) {
            return new AuthResponse(genericMessage, null, null, null, null, null);
        }

        String email = request.getEmail().trim().toLowerCase();
        AppUser user = appUserRepository.findByEmailIgnoreCase(email).orElse(null);

        if (user == null) {
            return new AuthResponse(genericMessage, null, null, null, null, null);
        }

        String resetToken = generateToken();
        user.setResetPasswordToken(resetToken);
        user.setResetPasswordTokenExpiry(LocalDateTime.now().plusMinutes(15));
        appUserRepository.save(user);

        // TODO: Deliver reset instructions through SendGrid, Resend, or SMTP.

        return new AuthResponse(genericMessage, null, null, null, null, null);
    }

    public AuthResponse resetPassword(ResetPasswordRequest request) {
        if (request == null || isBlank(request.getToken())) {
            return new AuthResponse("Invalid reset token", null, null, null, null, null);
        }

        if (isBlank(request.getNewPassword())) {
            return new AuthResponse("New password is required", null, null, null, null, null);
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return new AuthResponse("Passwords do not match", null, null, null, null, null);
        }

        AppUser user = appUserRepository.findByResetPasswordToken(request.getToken()).orElse(null);

        if (user == null) {
            return new AuthResponse("Invalid reset token", null, null, null, null, null);
        }

        if (user.getResetPasswordTokenExpiry() == null
                || user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            return new AuthResponse("Reset token has expired", null, null, null, null, null);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        appUserRepository.save(user);

        return new AuthResponse("Password reset successful. You can now login.", null, null, null, null, null);
    }

    private String generateToken() {
        return UUID.randomUUID().toString();
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}





