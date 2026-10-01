package com.fitmeal.backend;

import com.fitmeal.backend.model.AppUser;
import com.fitmeal.backend.model.UserProfile;
import com.fitmeal.backend.repository.AppUserRepository;
import com.fitmeal.backend.repository.UserProfileRepository;
import com.fitmeal.backend.service.JwtService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class SecurityAndProfileIntegrationTests {

    private final MockMvc mockMvc;
    private final AppUserRepository appUserRepository;
    private final UserProfileRepository userProfileRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Autowired
    SecurityAndProfileIntegrationTests(
            MockMvc mockMvc,
            AppUserRepository appUserRepository,
            UserProfileRepository userProfileRepository,
            BCryptPasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.mockMvc = mockMvc;
        this.appUserRepository = appUserRepository;
        this.userProfileRepository = userProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Test
    void protectedEndpointsRejectUnauthenticatedRequests() throws Exception {
        int mealsStatus = mockMvc.perform(get("/api/meals"))
                .andReturn()
                .getResponse()
                .getStatus();
        int profileStatus = mockMvc.perform(get("/api/profile/me"))
                .andReturn()
                .getResponse()
                .getStatus();

        assertTrue(mealsStatus == 401 || mealsStatus == 403);
        assertTrue(profileStatus == 401 || profileStatus == 403);
    }

    @Test
    void profileEndpointsAlwaysUseAuthenticatedUser() throws Exception {
        String suffix = UUID.randomUUID().toString();
        AppUser userA = appUserRepository.save(user("profile-a-" + suffix + "@example.com"));
        AppUser userB = appUserRepository.save(user("profile-b-" + suffix + "@example.com"));
        userProfileRepository.save(profile(userA.getEmail(), 25));
        userProfileRepository.save(profile(userB.getEmail(), 45));

        String authorization = "Bearer " + jwtService.generateToken(userA);

        mockMvc.perform(get("/api/profile/me")
                        .header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(userA.getEmail()))
                .andExpect(jsonPath("$.age").value(25));

        String updateBody = """
                {
                  "email": "%s",
                  "age": 31,
                  "height": 178,
                  "weight": 76,
                  "gender": "Male",
                  "fitnessGoal": "Maintenance",
                  "dailyCalorieGoal": 2200,
                  "dailyProteinGoal": 130,
                  "waterGoal": 2600,
                  "currentStreak": 4
                }
                """.formatted(userB.getEmail());

        mockMvc.perform(post("/api/profile/me")
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(updateBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(userA.getEmail()))
                .andExpect(jsonPath("$.age").value(31));

        assertEquals(31, userProfileRepository.findByEmail(userA.getEmail()).orElseThrow().getAge());
        assertEquals(45, userProfileRepository.findByEmail(userB.getEmail()).orElseThrow().getAge());

        mockMvc.perform(get("/api/profile/{email}", userB.getEmail())
                        .header("Authorization", authorization))
                .andExpect(status().isNotFound());
    }

    @Test
    void registrationUsesStableSuccessContractAndHashesPassword() throws Exception {
        String email = "register-" + UUID.randomUUID() + "@example.com";

        String requestBody = """
                {
                  "firstName": "Fit",
                  "lastName": "Meal",
                  "email": "%s",
                  "password": "password123",
                  "confirmPassword": "password123"
                }
                """.formatted(email);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(requestBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Registration successful. You can now login."))
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.token").doesNotExist());

        AppUser savedUser = appUserRepository.findByEmailIgnoreCase(email).orElseThrow();
        assertNotEquals("password123", savedUser.getPassword());
        assertTrue(passwordEncoder.matches("password123", savedUser.getPassword()));
        assertTrue(savedUser.isEmailVerified());
        assertNull(savedUser.getVerificationToken());
    }

    private AppUser user(String email) {
        AppUser user = new AppUser();
        user.setFirstName("Profile");
        user.setLastName("Owner");
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("password123"));
        user.setRole("USER");
        user.setEmailVerified(true);
        return user;
    }

    private UserProfile profile(String email, int age) {
        UserProfile profile = new UserProfile();
        profile.setEmail(email);
        profile.setAge(age);
        profile.setHeight(175);
        profile.setWeight(75);
        profile.setGender("Male");
        profile.setFitnessGoal("Maintenance");
        profile.setDailyCalorieGoal(2200);
        profile.setDailyProteinGoal(130);
        profile.setWaterGoal(2600);
        profile.setCurrentStreak(3);
        return profile;
    }
}
