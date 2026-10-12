package com.fitmeal.backend.service;

import com.fitmeal.backend.model.CatalogIngredient;
import com.fitmeal.backend.model.CatalogMeal;
import com.fitmeal.backend.model.CatalogMealCategory;
import com.fitmeal.backend.model.RecipeInstruction;
import com.fitmeal.backend.repository.CatalogMealRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.io.InputStream;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.Set;

@Component
@ConditionalOnProperty(
        name = "fitmeal.catalog.seed-enabled",
        havingValue = "true",
        matchIfMissing = true
)
public class CatalogMealSeeder implements ApplicationRunner {

    private static final Logger logger = LoggerFactory.getLogger(CatalogMealSeeder.class);
    private static final String CATALOG_RESOURCE = "catalog/meal-catalog.json";

    private final CatalogMealRepository catalogMealRepository;
    private final ObjectMapper objectMapper;

    public CatalogMealSeeder(CatalogMealRepository catalogMealRepository, ObjectMapper objectMapper) {
        this.catalogMealRepository = catalogMealRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments arguments) throws Exception {
        List<CatalogMealSeedData> seeds = readSeeds();
        validateUniqueSlugs(seeds);

        int insertedCount = 0;
        int updatedCount = 0;

        for (CatalogMealSeedData seed : seeds) {
            CatalogMeal existingMeal = catalogMealRepository.findBySlugIgnoreCase(seed.slug()).orElse(null);

            if (existingMeal != null) {
                if (!Objects.equals(existingMeal.getImagePath(), seed.imagePath())) {
                    existingMeal.setImagePath(seed.imagePath());
                    catalogMealRepository.save(existingMeal);
                    updatedCount++;
                }
                continue;
            }

            catalogMealRepository.save(toEntity(seed));
            insertedCount++;
        }

        logger.info(
                "FitMeal catalog ready: {} recipes available, {} inserted, {} refreshed",
                catalogMealRepository.count(),
                insertedCount,
                updatedCount
        );
    }

    private List<CatalogMealSeedData> readSeeds() throws Exception {
        ClassPathResource resource = new ClassPathResource(CATALOG_RESOURCE);

        try (InputStream inputStream = resource.getInputStream()) {
            return objectMapper.readValue(
                    inputStream,
                    new TypeReference<List<CatalogMealSeedData>>() {
                    }
            );
        }
    }

    private void validateUniqueSlugs(List<CatalogMealSeedData> seeds) {
        Set<String> slugs = new HashSet<>();

        for (CatalogMealSeedData seed : seeds) {
            String normalizedSlug = seed.slug().toLowerCase(Locale.ROOT);
            if (!slugs.add(normalizedSlug)) {
                throw new IllegalStateException("Duplicate catalog meal slug: " + seed.slug());
            }
        }
    }

    private CatalogMeal toEntity(CatalogMealSeedData seed) {
        CatalogMeal meal = new CatalogMeal();
        meal.setSlug(seed.slug());
        meal.setName(seed.name());
        meal.setDescription(seed.description());
        meal.setCategory(CatalogMealCategory.valueOf(seed.category().toUpperCase(Locale.ROOT)));
        meal.setImagePath(seed.imagePath());
        meal.setServingSize(seed.servingSize());
        meal.setCalories(seed.calories());
        meal.setProtein(seed.protein());
        meal.setCarbohydrates(seed.carbohydrates());
        meal.setFat(seed.fat());
        meal.setFiber(seed.fiber());
        meal.setPrepMinutes(seed.prepMinutes());
        meal.setCookMinutes(seed.cookMinutes());
        meal.setDietaryTags(seed.dietaryTags());
        meal.setEquipment(seed.equipment());

        seed.ingredients().forEach(ingredient -> meal.addIngredient(new CatalogIngredient(
                ingredient.displayOrder(),
                ingredient.quantity(),
                ingredient.unit(),
                ingredient.name(),
                ingredient.preparationNote()
        )));

        seed.instructions().forEach(instruction -> meal.addInstruction(new RecipeInstruction(
                instruction.stepNumber(),
                instruction.title(),
                instruction.instruction(),
                instruction.estimatedMinutes(),
                instruction.safetyNote()
        )));

        return meal;
    }
}
