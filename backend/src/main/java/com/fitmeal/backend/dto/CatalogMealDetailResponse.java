package com.fitmeal.backend.dto;

import com.fitmeal.backend.model.CatalogMealCategory;

import java.util.List;

public record CatalogMealDetailResponse(
        Long id,
        String slug,
        String name,
        String description,
        CatalogMealCategory category,
        String imagePath,
        String servingSize,
        int calories,
        int protein,
        int carbohydrates,
        int fat,
        int fiber,
        int prepMinutes,
        int cookMinutes,
        List<String> dietaryTags,
        List<String> equipment,
        List<CatalogIngredientResponse> ingredients,
        List<RecipeInstructionResponse> instructions
) {
}
