package com.fitmeal.backend.dto;

import org.springframework.data.domain.Page;

import java.util.List;

public record CatalogMealPageResponse(
        List<CatalogMealSummaryResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
    public static CatalogMealPageResponse from(Page<CatalogMealSummaryResponse> result) {
        return new CatalogMealPageResponse(
                result.getContent(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages()
        );
    }
}
