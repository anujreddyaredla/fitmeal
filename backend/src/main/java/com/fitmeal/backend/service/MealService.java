package com.fitmeal.backend.service;

import com.fitmeal.backend.model.AppUser;
import com.fitmeal.backend.model.Meal;
import com.fitmeal.backend.repository.AppUserRepository;
import com.fitmeal.backend.repository.MealRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class MealService {

    private final MealRepository mealRepository;
    private final AppUserRepository appUserRepository;

    public MealService(MealRepository mealRepository, AppUserRepository appUserRepository) {
        this.mealRepository = mealRepository;
        this.appUserRepository = appUserRepository;
    }

    public List<Meal> getMeals(String ownerEmail) {
        return mealRepository.findByOwner_EmailOrderByIdAsc(ownerEmail);
    }

    public Meal addMeal(String ownerEmail, Meal meal) {
        meal.setId(null);
        meal.setOwner(getAuthenticatedUser(ownerEmail));
        return mealRepository.save(meal);
    }

    public Meal getMealById(String ownerEmail, Long id) {
        return mealRepository.findByIdAndOwner_Email(id, ownerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Meal not found"));
    }

    public List<Meal> getMealsByType(String ownerEmail, String mealType) {
        return mealRepository.findByMealTypeIgnoreCaseAndOwner_Email(mealType, ownerEmail);
    }

    public Meal updateMeal(String ownerEmail, Long id, Meal updatedMeal) {
        Meal meal = getMealById(ownerEmail, id);

        meal.setName(updatedMeal.getName());
        meal.setMealType(updatedMeal.getMealType());
        meal.setCalories(updatedMeal.getCalories());
        meal.setProtein(updatedMeal.getProtein());

        return mealRepository.save(meal);
    }

    public void deleteMeal(String ownerEmail, Long id) {
        Meal meal = getMealById(ownerEmail, id);
        mealRepository.delete(meal);
    }

    private AppUser getAuthenticatedUser(String ownerEmail) {
        return appUserRepository.findByEmailIgnoreCase(ownerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found"));
    }
}
