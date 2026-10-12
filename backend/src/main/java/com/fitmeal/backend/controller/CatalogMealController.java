package com.fitmeal.backend.controller;

import com.fitmeal.backend.dto.CatalogMealDetailResponse;
import com.fitmeal.backend.dto.CatalogMealPageResponse;
import com.fitmeal.backend.service.CatalogMealService;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/catalog/meals")
public class CatalogMealController {

    private final CatalogMealService catalogMealService;

    public CatalogMealController(CatalogMealService catalogMealService) {
        this.catalogMealService = catalogMealService;
    }

    @GetMapping
    public CatalogMealPageResponse getMeals(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 24, sort = "name") Pageable pageable
    ) {
        return CatalogMealPageResponse.from(catalogMealService.getMeals(category, search, pageable));
    }

    @GetMapping("/{slug}")
    public CatalogMealDetailResponse getMealBySlug(@PathVariable String slug) {
        return catalogMealService.getMealBySlug(slug);
    }
}
