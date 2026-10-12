package com.fitmeal.backend;

import com.fitmeal.backend.model.AppUser;
import com.fitmeal.backend.model.CatalogMeal;
import com.fitmeal.backend.model.CatalogMealCategory;
import com.fitmeal.backend.repository.AppUserRepository;
import com.fitmeal.backend.repository.CatalogMealRepository;
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

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CatalogMealPlanIntegrationTests {

    private final MockMvc mockMvc;
    private final CatalogMealRepository catalogMealRepository;
    private final AppUserRepository appUserRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Autowired
    CatalogMealPlanIntegrationTests(
            MockMvc mockMvc,
            CatalogMealRepository catalogMealRepository,
            AppUserRepository appUserRepository,
            BCryptPasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.mockMvc = mockMvc;
        this.catalogMealRepository = catalogMealRepository;
        this.appUserRepository = appUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Test
    void catalogPlannerAssignmentRequiresAuthentication() throws Exception {
        CatalogMeal meal = catalogMealRepository.save(catalogMeal("protected-bowl", "Protected Bowl", 500, 40));

        mockMvc.perform(post("/api/meal-plans/catalog")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(assignmentJson(meal.getId(), "Monday", "LUNCH")))
                .andExpect(status().isForbidden());
    }

    @Test
    void catalogMealCreatesPlanAndReplacementAdjustsNutritionTotals() throws Exception {
        CatalogMeal firstMeal = catalogMealRepository.save(catalogMeal("chicken-bowl", "Chicken Bowl", 620, 48));
        CatalogMeal replacement = catalogMealRepository.save(catalogMeal("salmon-bowl", "Salmon Bowl", 540, 39));
        String authorization = authorizationForNewUser("planner-owner");

        mockMvc.perform(post("/api/meal-plans/catalog")
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(assignmentJson(firstMeal.getId(), "monday", "lunch")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.day").value("Monday"))
                .andExpect(jsonPath("$.lunch").value("Chicken Bowl"))
                .andExpect(jsonPath("$.totalCalories").value(620))
                .andExpect(jsonPath("$.totalProtein").value(48));

        mockMvc.perform(post("/api/meal-plans/catalog")
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(assignmentJson(replacement.getId(), "Monday", "LUNCH")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.lunch").value("Salmon Bowl"))
                .andExpect(jsonPath("$.totalCalories").value(540))
                .andExpect(jsonPath("$.totalProtein").value(39));

        mockMvc.perform(get("/api/meal-plans").header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void catalogAssignmentsRemainIsolatedPerAuthenticatedUser() throws Exception {
        CatalogMeal meal = catalogMealRepository.save(catalogMeal("shared-recipe", "Shared Recipe", 410, 31));
        String userAAuthorization = authorizationForNewUser("planner-a");
        String userBAuthorization = authorizationForNewUser("planner-b");

        mockMvc.perform(post("/api/meal-plans/catalog")
                        .header("Authorization", userAAuthorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(assignmentJson(meal.getId(), "Friday", "DINNER")))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/meal-plans").header("Authorization", userAAuthorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].dinner").value("Shared Recipe"));

        mockMvc.perform(get("/api/meal-plans").header("Authorization", userBAuthorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    private CatalogMeal catalogMeal(String slug, String name, int calories, int protein) {
        CatalogMeal meal = new CatalogMeal();
        meal.setSlug(slug);
        meal.setName(name);
        meal.setDescription("A balanced catalog meal for planner integration testing.");
        meal.setCategory(CatalogMealCategory.LUNCH);
        meal.setImagePath("/images/meals/placeholder.webp");
        meal.setServingSize("1 bowl");
        meal.setCalories(calories);
        meal.setProtein(protein);
        meal.setCarbohydrates(55);
        meal.setFat(16);
        meal.setFiber(8);
        meal.setPrepMinutes(10);
        meal.setCookMinutes(20);
        return meal;
    }

    private String authorizationForNewUser(String prefix) {
        AppUser user = new AppUser();
        user.setFirstName("Planner");
        user.setLastName("Tester");
        user.setEmail(prefix + "-" + UUID.randomUUID() + "@example.com");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setRole("USER");
        user.setEmailVerified(true);
        return "Bearer " + jwtService.generateToken(appUserRepository.save(user));
    }

    private String assignmentJson(Long catalogMealId, String day, String slot) {
        return """
                {
                  "catalogMealId": %d,
                  "day": "%s",
                  "slot": "%s"
                }
                """.formatted(catalogMealId, day, slot);
    }
}
