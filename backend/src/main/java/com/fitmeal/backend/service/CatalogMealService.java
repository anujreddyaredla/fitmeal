package com.fitmeal.backend.service;

import com.fitmeal.backend.dto.CatalogIngredientResponse;
import com.fitmeal.backend.dto.CatalogMealDetailResponse;
import com.fitmeal.backend.dto.CatalogMealSummaryResponse;
import com.fitmeal.backend.dto.RecipeInstructionResponse;
import com.fitmeal.backend.model.CatalogMeal;
import com.fitmeal.backend.model.CatalogMealCategory;
import com.fitmeal.backend.repository.CatalogMealRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Locale;

@Service
public class CatalogMealService {

    private final CatalogMealRepository catalogMealRepository;

    public CatalogMealService(CatalogMealRepository catalogMealRepository) {
        this.catalogMealRepository = catalogMealRepository;
    }

    @Transactional(readOnly = true)
    public Page<CatalogMealSummaryResponse> getMeals(
            String category,
            String search,
            Pageable pageable
    ) {
        CatalogMealCategory parsedCategory = parseCategory(category);
        String normalizedSearch = normalizeSearch(search);

        return catalogMealRepository.search(parsedCategory, normalizedSearch, pageable)
                .map(this::toSummaryResponse);
    }

    @Transactional(readOnly = true)
    public CatalogMealDetailResponse getMealBySlug(String slug) {
        if (slug == null || slug.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Meal slug is required");
        }

        CatalogMeal meal = catalogMealRepository.findBySlugIgnoreCase(slug.trim())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Catalog meal not found"));

        return toDetailResponse(meal);
    }

    private CatalogMealCategory parseCategory(String category) {
        if (category == null || category.isBlank()) {
            return null;
        }

        try {
            return CatalogMealCategory.valueOf(category.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException exception) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Category must be BREAKFAST, LUNCH, SNACK, or DINNER"
            );
        }
    }

    private String normalizeSearch(String search) {
        return search == null || search.isBlank() ? null : search.trim();
    }

    private CatalogMealSummaryResponse toSummaryResponse(CatalogMeal meal) {
        return new CatalogMealSummaryResponse(
                meal.getId(),
                meal.getSlug(),
                meal.getName(),
                meal.getDescription(),
                meal.getCategory(),
                meal.getImagePath(),
                meal.getServingSize(),
                meal.getCalories(),
                meal.getProtein(),
                meal.getCarbohydrates(),
                meal.getFat(),
                meal.getFiber(),
                meal.getPrepMinutes(),
                meal.getCookMinutes(),
                List.copyOf(meal.getDietaryTags())
        );
    }

    private CatalogMealDetailResponse toDetailResponse(CatalogMeal meal) {
        List<CatalogIngredientResponse> ingredients = meal.getIngredients().stream()
                .map(ingredient -> new CatalogIngredientResponse(
                        ingredient.getDisplayOrder(),
                        ingredient.getQuantity(),
                        ingredient.getUnit(),
                        ingredient.getName(),
                        ingredient.getPreparationNote()
                ))
                .toList();

        List<RecipeInstructionResponse> instructions = meal.getInstructions().stream()
                .map(instruction -> new RecipeInstructionResponse(
                        instruction.getStepNumber(),
                        instruction.getTitle(),
                        instruction.getInstruction(),
                        instruction.getEstimatedMinutes(),
                        instruction.getSafetyNote()
                ))
                .toList();

        return new CatalogMealDetailResponse(
                meal.getId(),
                meal.getSlug(),
                meal.getName(),
                meal.getDescription(),
                meal.getCategory(),
                meal.getImagePath(),
                meal.getServingSize(),
                meal.getCalories(),
                meal.getProtein(),
                meal.getCarbohydrates(),
                meal.getFat(),
                meal.getFiber(),
                meal.getPrepMinutes(),
                meal.getCookMinutes(),
                List.copyOf(meal.getDietaryTags()),
                List.copyOf(meal.getEquipment()),
                ingredients,
                instructions
        );
    }
}
