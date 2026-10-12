package com.fitmeal.backend.service;

import java.util.List;

public record CatalogMealSeedData(
        String slug,
        String name,
        String description,
        String category,
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
        List<IngredientSeedData> ingredients,
        List<InstructionSeedData> instructions
) {
    public record IngredientSeedData(
            int displayOrder,
            String quantity,
            String unit,
            String name,
            String preparationNote
    ) {
    }

    public record InstructionSeedData(
            int stepNumber,
            String title,
            String instruction,
            Integer estimatedMinutes,
            String safetyNote
    ) {
    }
}
