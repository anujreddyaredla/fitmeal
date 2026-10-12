package com.fitmeal.backend.controller;

import com.fitmeal.backend.dto.CatalogMealPlanRequest;
import com.fitmeal.backend.model.MealPlan;
import com.fitmeal.backend.service.MealPlanService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
@RestController
@RequestMapping("/api/meal-plans")
public class MealPlanController {

    private final MealPlanService mealPlanService;

    public MealPlanController(MealPlanService mealPlanService) {
        this.mealPlanService = mealPlanService;
    }

    @GetMapping
    public List<MealPlan> getAllPlans(Authentication authentication) {
        return mealPlanService.getAllPlans(getUserEmail(authentication));
    }

    @PostMapping
    public MealPlan addPlan(Authentication authentication, @RequestBody MealPlan plan) {
        return mealPlanService.addPlan(getUserEmail(authentication), plan);
    }

    @PostMapping("/catalog")
    public MealPlan addCatalogMeal(
            Authentication authentication,
            @Valid @RequestBody CatalogMealPlanRequest request
    ) {
        return mealPlanService.addCatalogMeal(getUserEmail(authentication), request);
    }

    @PutMapping("/{id}")
    public MealPlan updatePlan(Authentication authentication, @PathVariable Long id, @RequestBody MealPlan plan) {
        return mealPlanService.updatePlan(getUserEmail(authentication), id, plan);
    }

    @DeleteMapping("/{id}")
    public String deletePlan(Authentication authentication, @PathVariable Long id) {
        mealPlanService.deletePlan(getUserEmail(authentication), id);
        return "Meal plan deleted successfully";
    }

    private String getUserEmail(Authentication authentication) {
        return authentication.getName();
    }
}
