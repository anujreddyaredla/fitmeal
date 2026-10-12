package com.fitmeal.backend.dto;

public record RecipeInstructionResponse(
        int stepNumber,
        String title,
        String instruction,
        Integer estimatedMinutes,
        String safetyNote
) {
}
