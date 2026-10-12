package com.fitmeal.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CatalogMealPlanRequest(
        @NotNull(message = "Catalog meal is required") Long catalogMealId,
        @NotBlank(message = "Day is required") String day,
        @NotBlank(message = "Meal slot is required") String slot
) {
}
