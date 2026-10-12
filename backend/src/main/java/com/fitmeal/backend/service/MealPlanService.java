package com.fitmeal.backend.service;

import com.fitmeal.backend.dto.CatalogMealPlanRequest;
import com.fitmeal.backend.model.AppUser;
import com.fitmeal.backend.model.CatalogMeal;
import com.fitmeal.backend.model.MealPlan;
import com.fitmeal.backend.repository.AppUserRepository;
import com.fitmeal.backend.repository.CatalogMealRepository;
import com.fitmeal.backend.repository.MealPlanRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

@Service
public class MealPlanService {

    private final MealPlanRepository mealPlanRepository;
    private final AppUserRepository appUserRepository;
    private final CatalogMealRepository catalogMealRepository;

    private static final Map<String, String> WEEK_DAYS = createWeekDays();
    private static final List<String> MEAL_SLOTS = List.of("BREAKFAST", "LUNCH", "DINNER", "SNACK");

    public MealPlanService(
            MealPlanRepository mealPlanRepository,
            AppUserRepository appUserRepository,
            CatalogMealRepository catalogMealRepository
    ) {
        this.mealPlanRepository = mealPlanRepository;
        this.appUserRepository = appUserRepository;
        this.catalogMealRepository = catalogMealRepository;
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

        clearCatalogSelectionWhenMealNameChanges(plan, updatedPlan);
        plan.setDay(updatedPlan.getDay());
        plan.setBreakfast(updatedPlan.getBreakfast());
        plan.setLunch(updatedPlan.getLunch());
        plan.setDinner(updatedPlan.getDinner());
        plan.setSnack(updatedPlan.getSnack());
        plan.setTotalCalories(updatedPlan.getTotalCalories());
        plan.setTotalProtein(updatedPlan.getTotalProtein());

        return mealPlanRepository.save(plan);
    }

    @Transactional
    public MealPlan addCatalogMeal(String ownerEmail, CatalogMealPlanRequest request) {
        String day = normalizeDay(request.day());
        String slot = normalizeSlot(request.slot());
        CatalogMeal catalogMeal = catalogMealRepository.findById(request.catalogMealId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Catalog meal not found"));

        MealPlan plan = mealPlanRepository.findFirstByOwner_EmailAndDayIgnoreCase(ownerEmail, day)
                .orElseGet(() -> newPlan(ownerEmail, day));

        CatalogMeal previousMeal = getCatalogMealForSlot(plan, slot);
        int previousCalories = previousMeal == null ? 0 : previousMeal.getCalories();
        int previousProtein = previousMeal == null ? 0 : previousMeal.getProtein();

        setCatalogMealForSlot(plan, slot, catalogMeal);
        plan.setTotalCalories(Math.max(0, plan.getTotalCalories() - previousCalories + catalogMeal.getCalories()));
        plan.setTotalProtein(Math.max(0, plan.getTotalProtein() - previousProtein + catalogMeal.getProtein()));

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

    private MealPlan newPlan(String ownerEmail, String day) {
        MealPlan plan = new MealPlan();
        plan.setOwner(getAuthenticatedUser(ownerEmail));
        plan.setDay(day);
        return plan;
    }

    private String normalizeDay(String day) {
        String normalizedDay = day == null ? "" : day.trim().toUpperCase(Locale.ROOT);
        String canonicalDay = WEEK_DAYS.get(normalizedDay);

        if (canonicalDay == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a valid day from Monday to Sunday");
        }

        return canonicalDay;
    }

    private String normalizeSlot(String slot) {
        String normalizedSlot = slot == null ? "" : slot.trim().toUpperCase(Locale.ROOT);

        if (!MEAL_SLOTS.contains(normalizedSlot)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Meal slot must be BREAKFAST, LUNCH, DINNER, or SNACK"
            );
        }

        return normalizedSlot;
    }

    private CatalogMeal getCatalogMealForSlot(MealPlan plan, String slot) {
        return switch (slot) {
            case "BREAKFAST" -> plan.getBreakfastCatalogMeal();
            case "LUNCH" -> plan.getLunchCatalogMeal();
            case "DINNER" -> plan.getDinnerCatalogMeal();
            case "SNACK" -> plan.getSnackCatalogMeal();
            default -> null;
        };
    }

    private void setCatalogMealForSlot(MealPlan plan, String slot, CatalogMeal catalogMeal) {
        switch (slot) {
            case "BREAKFAST" -> {
                plan.setBreakfast(catalogMeal.getName());
                plan.setBreakfastCatalogMeal(catalogMeal);
            }
            case "LUNCH" -> {
                plan.setLunch(catalogMeal.getName());
                plan.setLunchCatalogMeal(catalogMeal);
            }
            case "DINNER" -> {
                plan.setDinner(catalogMeal.getName());
                plan.setDinnerCatalogMeal(catalogMeal);
            }
            case "SNACK" -> {
                plan.setSnack(catalogMeal.getName());
                plan.setSnackCatalogMeal(catalogMeal);
            }
            default -> throw new IllegalStateException("Unexpected meal slot: " + slot);
        }
    }

    private void clearCatalogSelectionWhenMealNameChanges(MealPlan plan, MealPlan updatedPlan) {
        if (!Objects.equals(plan.getBreakfast(), updatedPlan.getBreakfast())) {
            plan.setBreakfastCatalogMeal(null);
        }
        if (!Objects.equals(plan.getLunch(), updatedPlan.getLunch())) {
            plan.setLunchCatalogMeal(null);
        }
        if (!Objects.equals(plan.getDinner(), updatedPlan.getDinner())) {
            plan.setDinnerCatalogMeal(null);
        }
        if (!Objects.equals(plan.getSnack(), updatedPlan.getSnack())) {
            plan.setSnackCatalogMeal(null);
        }
    }

    private static Map<String, String> createWeekDays() {
        Map<String, String> days = new LinkedHashMap<>();
        days.put("MONDAY", "Monday");
        days.put("TUESDAY", "Tuesday");
        days.put("WEDNESDAY", "Wednesday");
        days.put("THURSDAY", "Thursday");
        days.put("FRIDAY", "Friday");
        days.put("SATURDAY", "Saturday");
        days.put("SUNDAY", "Sunday");
        return Map.copyOf(days);
    }
}
