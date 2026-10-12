package com.fitmeal.backend;

import com.fitmeal.backend.model.CatalogMealCategory;
import com.fitmeal.backend.repository.CatalogMealRepository;
import com.fitmeal.backend.service.CatalogMealSeeder;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

@SpringBootTest(properties = "fitmeal.catalog.seed-enabled=true")
@Transactional
class CatalogMealSeederIntegrationTests {

    private final CatalogMealRepository catalogMealRepository;
    private final CatalogMealSeeder catalogMealSeeder;

    @Autowired
    CatalogMealSeederIntegrationTests(
            CatalogMealRepository catalogMealRepository,
            CatalogMealSeeder catalogMealSeeder
    ) {
        this.catalogMealRepository = catalogMealRepository;
        this.catalogMealSeeder = catalogMealSeeder;
    }

    @Test
    void starterCatalogIsCompleteAndIdempotent() throws Exception {
        assertEquals(24, catalogMealRepository.count());

        for (CatalogMealCategory category : CatalogMealCategory.values()) {
            long categoryCount = catalogMealRepository.findAll().stream()
                    .filter(meal -> meal.getCategory() == category)
                    .count();
            assertEquals(6, categoryCount);
        }

        var chickenRiceBowl = catalogMealRepository.findBySlugIgnoreCase("chicken-rice-bowl")
                .orElseThrow();
        assertFalse(chickenRiceBowl.getIngredients().isEmpty());
        assertFalse(chickenRiceBowl.getInstructions().isEmpty());
        chickenRiceBowl.setImagePath("/images/meals/outdated-placeholder.webp");
        catalogMealRepository.save(chickenRiceBowl);

        catalogMealSeeder.run(null);

        assertEquals(24, catalogMealRepository.count());
        assertEquals(
                "/images/meals/chicken-rice-bowl.jpg",
                catalogMealRepository.findBySlugIgnoreCase("chicken-rice-bowl").orElseThrow().getImagePath()
        );
    }
}
