package com.fitmeal.backend;

import com.fitmeal.backend.model.AppUser;
import com.fitmeal.backend.model.CatalogIngredient;
import com.fitmeal.backend.model.CatalogMeal;
import com.fitmeal.backend.model.CatalogMealCategory;
import com.fitmeal.backend.model.RecipeInstruction;
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

import java.util.List;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CatalogMealIntegrationTests {

    private final MockMvc mockMvc;
    private final CatalogMealRepository catalogMealRepository;
    private final AppUserRepository appUserRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Autowired
    CatalogMealIntegrationTests(
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
    void catalogEndpointsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/catalog/meals"))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/catalog/meals/chicken-rice-bowl"))
                .andExpect(status().isForbidden());
    }

    @Test
    void catalogCanBeFilteredByCategoryAndSearchedByIngredient() throws Exception {
        catalogMealRepository.save(catalogMeal(
                "berry-oats",
                "Berry Oats",
                CatalogMealCategory.BREAKFAST,
                "rolled oats"
        ));
        catalogMealRepository.save(catalogMeal(
                "chicken-rice-bowl",
                "Chicken and Rice Bowl",
                CatalogMealCategory.LUNCH,
                "chicken breast"
        ));

        String authorization = authorizationForNewUser();

        mockMvc.perform(get("/api/catalog/meals")
                        .queryParam("category", "breakfast")
                        .header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].slug").value("berry-oats"))
                .andExpect(jsonPath("$.content[0].category").value("BREAKFAST"));

        mockMvc.perform(get("/api/catalog/meals")
                        .queryParam("search", "chick")
                        .header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].slug").value("chicken-rice-bowl"));
    }

    @Test
    void catalogDetailReturnsStructuredRecipeData() throws Exception {
        catalogMealRepository.save(catalogMeal(
                "salmon-rice-bowl",
                "Salmon and Rice Bowl",
                CatalogMealCategory.DINNER,
                "salmon fillet"
        ));

        mockMvc.perform(get("/api/catalog/meals/salmon-rice-bowl")
                        .header("Authorization", authorizationForNewUser()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Salmon and Rice Bowl"))
                .andExpect(jsonPath("$.calories").value(620))
                .andExpect(jsonPath("$.protein").value(42))
                .andExpect(jsonPath("$.carbohydrates").value(65))
                .andExpect(jsonPath("$.fat").value(20))
                .andExpect(jsonPath("$.fiber").value(7))
                .andExpect(jsonPath("$.equipment[0]").value("Saucepan"))
                .andExpect(jsonPath("$.ingredients[0].name").value("salmon fillet"))
                .andExpect(jsonPath("$.instructions[0].title").value("Prepare the ingredients"));
    }

    @Test
    void invalidCategoryAndMissingSlugReturnReadableErrors() throws Exception {
        String authorization = authorizationForNewUser();

        mockMvc.perform(get("/api/catalog/meals")
                        .queryParam("category", "BRUNCH")
                        .header("Authorization", authorization))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message")
                        .value("Category must be BREAKFAST, LUNCH, SNACK, or DINNER"));

        mockMvc.perform(get("/api/catalog/meals/not-a-real-meal")
                        .header("Authorization", authorization))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Catalog meal not found"));
    }

    @Test
    void catalogIsSharedReadOnlyReferenceData() throws Exception {
        catalogMealRepository.save(catalogMeal(
                "greek-yogurt-bowl",
                "Greek Yogurt Bowl",
                CatalogMealCategory.SNACK,
                "Greek yogurt"
        ));

        String userAAuthorization = authorizationForNewUser();
        String userBAuthorization = authorizationForNewUser();

        mockMvc.perform(get("/api/catalog/meals")
                        .header("Authorization", userAAuthorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));

        mockMvc.perform(get("/api/catalog/meals")
                        .header("Authorization", userBAuthorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));

        mockMvc.perform(post("/api/catalog/meals")
                        .header("Authorization", userAAuthorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isMethodNotAllowed());
    }

    private CatalogMeal catalogMeal(
            String slug,
            String name,
            CatalogMealCategory category,
            String mainIngredient
    ) {
        CatalogMeal meal = new CatalogMeal();
        meal.setSlug(slug);
        meal.setName(name);
        meal.setDescription("A balanced meal with simple ingredients.");
        meal.setCategory(category);
        meal.setImagePath("/images/meals/placeholder.webp");
        meal.setServingSize("1 bowl");
        meal.setCalories(620);
        meal.setProtein(42);
        meal.setCarbohydrates(65);
        meal.setFat(20);
        meal.setFiber(7);
        meal.setPrepMinutes(10);
        meal.setCookMinutes(20);
        meal.setDietaryTags(List.of("Balanced", "High Protein"));
        meal.setEquipment(List.of("Saucepan", "Frying pan"));
        meal.addIngredient(new CatalogIngredient(1, "150", "g", mainIngredient, "Cut into even pieces"));
        meal.addInstruction(new RecipeInstruction(
                1,
                "Prepare the ingredients",
                "Measure the ingredients and place them on a clean work surface.",
                5,
                "Wash your hands before and after handling raw ingredients."
        ));
        return meal;
    }

    private String authorizationForNewUser() {
        AppUser user = new AppUser();
        user.setFirstName("Catalog");
        user.setLastName("Reader");
        user.setEmail("catalog-" + UUID.randomUUID() + "@example.com");
        user.setPassword(passwordEncoder.encode("password123"));
        user.setRole("USER");
        user.setEmailVerified(true);
        AppUser savedUser = appUserRepository.save(user);

        return "Bearer " + jwtService.generateToken(savedUser);
    }
}
