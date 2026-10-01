package com.fitmeal.backend.controller;

import com.fitmeal.backend.model.Meal;
import com.fitmeal.backend.service.MealService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
@RestController
public class MealController {

    private final MealService mealService;

    public MealController(MealService mealService) {
        this.mealService = mealService;
    }

    @GetMapping("/api/meals")
    public List<Meal> getMeals(Authentication authentication) {
        return mealService.getMeals(getUserEmail(authentication));
    }

    @PostMapping("/api/meals")
    public Meal addMeal(Authentication authentication, @Valid @RequestBody Meal meal) {
        return mealService.addMeal(getUserEmail(authentication), meal);
    }

    @GetMapping("/api/meals/type/{mealType}")
    public List<Meal> getMealsByType(Authentication authentication, @PathVariable String mealType) {
        return mealService.getMealsByType(getUserEmail(authentication), mealType);
    }

    @GetMapping("/api/meals/{id}")
    public Meal getMealById(Authentication authentication, @PathVariable Long id) {
        return mealService.getMealById(getUserEmail(authentication), id);
    }

    @PutMapping("/api/meals/{id}")
    public Meal updateMeal(Authentication authentication, @PathVariable Long id, @Valid @RequestBody Meal meal) {
        return mealService.updateMeal(getUserEmail(authentication), id, meal);
    }

    @DeleteMapping("/api/meals/{id}")
    public String deleteMeal(Authentication authentication, @PathVariable Long id) {
        mealService.deleteMeal(getUserEmail(authentication), id);
        return "Meal deleted successfully";
    }

    private String getUserEmail(Authentication authentication) {
        return authentication.getName();
    }
}
