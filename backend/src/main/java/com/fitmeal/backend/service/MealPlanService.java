package com.fitmeal.backend.service;

import com.fitmeal.backend.model.AppUser;
import com.fitmeal.backend.model.MealPlan;
import com.fitmeal.backend.repository.AppUserRepository;
import com.fitmeal.backend.repository.MealPlanRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class MealPlanService {

    private final MealPlanRepository mealPlanRepository;
    private final AppUserRepository appUserRepository;

    public MealPlanService(MealPlanRepository mealPlanRepository, AppUserRepository appUserRepository) {
        this.mealPlanRepository = mealPlanRepository;
        this.appUserRepository = appUserRepository;
    }

    public List<MealPlan> getAllPlans(String ownerEmail) {
        return mealPlanRepository.findByOwner_EmailOrderByIdAsc(ownerEmail);
    }

    public MealPlan addPlan(String ownerEmail, MealPlan plan) {
        plan.setId(null);
        plan.setOwner(getAuthenticatedUser(ownerEmail));
        return mealPlanRepository.save(plan);
    }

    public MealPlan updatePlan(String ownerEmail, Long id, MealPlan updatedPlan) {
        MealPlan plan = getPlanById(ownerEmail, id);

        plan.setDay(updatedPlan.getDay());
        plan.setBreakfast(updatedPlan.getBreakfast());
        plan.setLunch(updatedPlan.getLunch());
        plan.setDinner(updatedPlan.getDinner());
        plan.setSnack(updatedPlan.getSnack());
        plan.setTotalCalories(updatedPlan.getTotalCalories());
        plan.setTotalProtein(updatedPlan.getTotalProtein());

        return mealPlanRepository.save(plan);
    }

    public void deletePlan(String ownerEmail, Long id) {
        MealPlan plan = getPlanById(ownerEmail, id);
        mealPlanRepository.delete(plan);
    }

    private MealPlan getPlanById(String ownerEmail, Long id) {
        return mealPlanRepository.findByIdAndOwner_Email(id, ownerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Meal plan not found"));
    }

    private AppUser getAuthenticatedUser(String ownerEmail) {
        return appUserRepository.findByEmailIgnoreCase(ownerEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user not found"));
    }
}
