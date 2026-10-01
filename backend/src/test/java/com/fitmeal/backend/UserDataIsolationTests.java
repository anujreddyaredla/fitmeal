package com.fitmeal.backend;

import com.fitmeal.backend.model.AppUser;
import com.fitmeal.backend.model.GroceryItem;
import com.fitmeal.backend.model.Meal;
import com.fitmeal.backend.model.MealPlan;
import com.fitmeal.backend.repository.AppUserRepository;
import com.fitmeal.backend.service.GroceryService;
import com.fitmeal.backend.service.MealPlanService;
import com.fitmeal.backend.service.MealService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional
class UserDataIsolationTests {

    private final AppUserRepository appUserRepository;
    private final MealService mealService;
    private final GroceryService groceryService;
    private final MealPlanService mealPlanService;

    @Autowired
    UserDataIsolationTests(
            AppUserRepository appUserRepository,
            MealService mealService,
            GroceryService groceryService,
            MealPlanService mealPlanService
    ) {
        this.appUserRepository = appUserRepository;
        this.mealService = mealService;
        this.groceryService = groceryService;
        this.mealPlanService = mealPlanService;
    }

    @Test
    void userCannotReadAnotherUsersMeals() {
        TestUsers users = createUsers();

        mealService.addMeal(users.userAEmail(), meal("User A Oats", "BREAKFAST"));
        mealService.addMeal(users.userBEmail(), meal("User B Bowl", "LUNCH"));

        assertEquals(1, mealService.getMeals(users.userAEmail()).size());
        assertEquals("User A Oats", mealService.getMeals(users.userAEmail()).get(0).getName());
        assertEquals(1, mealService.getMeals(users.userBEmail()).size());
        assertEquals("User B Bowl", mealService.getMeals(users.userBEmail()).get(0).getName());
    }

    @Test
    void userCannotUpdateOrDeleteAnotherUsersGroceryItems() {
        TestUsers users = createUsers();
        GroceryItem item = groceryService.addItem(users.userBEmail(), groceryItem("Chicken Breast"));

        assertThrows(ResponseStatusException.class, () ->
                groceryService.updateItem(users.userAEmail(), item.getId(), groceryItem("Rice"))
        );
        assertThrows(ResponseStatusException.class, () ->
                groceryService.deleteItem(users.userAEmail(), item.getId())
        );

        assertEquals(1, groceryService.getAllItems(users.userBEmail()).size());
        assertEquals("Chicken Breast", groceryService.getAllItems(users.userBEmail()).get(0).getName());
        assertTrue(groceryService.getAllItems(users.userAEmail()).isEmpty());
    }

    @Test
    void userCannotModifyAnotherUsersMealPlans() {
        TestUsers users = createUsers();
        MealPlan plan = mealPlanService.addPlan(users.userBEmail(), mealPlan("Monday"));

        assertThrows(ResponseStatusException.class, () ->
                mealPlanService.updatePlan(users.userAEmail(), plan.getId(), mealPlan("Tuesday"))
        );
        assertThrows(ResponseStatusException.class, () ->
                mealPlanService.deletePlan(users.userAEmail(), plan.getId())
        );

        assertEquals(1, mealPlanService.getAllPlans(users.userBEmail()).size());
        assertEquals("Monday", mealPlanService.getAllPlans(users.userBEmail()).get(0).getDay());
        assertTrue(mealPlanService.getAllPlans(users.userAEmail()).isEmpty());
    }

    private TestUsers createUsers() {
        String suffix = UUID.randomUUID().toString();
        String userAEmail = "user-a-" + suffix + "@example.com";
        String userBEmail = "user-b-" + suffix + "@example.com";

        appUserRepository.save(user(userAEmail, "A"));
        appUserRepository.save(user(userBEmail, "B"));

        return new TestUsers(userAEmail, userBEmail);
    }

    private AppUser user(String email, String name) {
        AppUser user = new AppUser();
        user.setFirstName("User" + name);
        user.setLastName("Test");
        user.setEmail(email);
        user.setPassword("test-password");
        user.setRole("USER");
        user.setEmailVerified(true);
        return user;
    }

    private Meal meal(String name, String mealType) {
        Meal meal = new Meal();
        meal.setName(name);
        meal.setMealType(mealType);
        meal.setCalories(400);
        meal.setProtein(30);
        return meal;
    }

    private GroceryItem groceryItem(String name) {
        GroceryItem item = new GroceryItem();
        item.setName(name);
        item.setCategory("Protein");
        item.setQuantity("1");
        item.setUnit("kg");
        item.setPurchased(false);
        return item;
    }

    private MealPlan mealPlan(String day) {
        MealPlan plan = new MealPlan();
        plan.setDay(day);
        plan.setBreakfast("Oats");
        plan.setLunch("Rice Bowl");
        plan.setDinner("Salmon");
        plan.setSnack("Yogurt");
        plan.setTotalCalories(1800);
        plan.setTotalProtein(120);
        return plan;
    }

    private record TestUsers(String userAEmail, String userBEmail) {
    }
}

