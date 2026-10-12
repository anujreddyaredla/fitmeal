package com.fitmeal.backend.dto;

public record CatalogIngredientResponse(
        int displayOrder,
        String quantity,
        String unit,
        String name,
        String preparationNote
) {
}
