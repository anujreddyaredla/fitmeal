package com.fitmeal.backend.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "meal_plans")
public class MealPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id")
    private AppUser owner;

    private String day;
    private String breakfast;
    private String lunch;
    private String dinner;
    private String snack;
    private int totalCalories;
    private int totalProtein;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "breakfast_catalog_meal_id")
    private CatalogMeal breakfastCatalogMeal;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lunch_catalog_meal_id")
    private CatalogMeal lunchCatalogMeal;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dinner_catalog_meal_id")
    private CatalogMeal dinnerCatalogMeal;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "snack_catalog_meal_id")
    private CatalogMeal snackCatalogMeal;

    public MealPlan() {
    }

    public MealPlan(
            Long id,
            String day,
            String breakfast,
            String lunch,
            String dinner,
            String snack,
            int totalCalories,
            int totalProtein
    ) {
        this.id = id;
        this.day = day;
        this.breakfast = breakfast;
        this.lunch = lunch;
        this.dinner = dinner;
        this.snack = snack;
        this.totalCalories = totalCalories;
        this.totalProtein = totalProtein;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public void setOwner(AppUser owner) {
        this.owner = owner;
    }

    public String getDay() {
        return day;
    }

    public void setDay(String day) {
        this.day = day;
    }

    public String getBreakfast() {
        return breakfast;
    }

    public void setBreakfast(String breakfast) {
        this.breakfast = breakfast;
    }

    public String getLunch() {
        return lunch;
    }

    public void setLunch(String lunch) {
        this.lunch = lunch;
    }

    public String getDinner() {
        return dinner;
    }

    public void setDinner(String dinner) {
        this.dinner = dinner;
    }

    public String getSnack() {
        return snack;
    }

    public void setSnack(String snack) {
        this.snack = snack;
    }

    public int getTotalCalories() {
        return totalCalories;
    }

    public void setTotalCalories(int totalCalories) {
        this.totalCalories = totalCalories;
    }

    public int getTotalProtein() {
        return totalProtein;
    }

    public void setTotalProtein(int totalProtein) {
        this.totalProtein = totalProtein;
    }

    public CatalogMeal getBreakfastCatalogMeal() {
        return breakfastCatalogMeal;
    }

    public void setBreakfastCatalogMeal(CatalogMeal breakfastCatalogMeal) {
        this.breakfastCatalogMeal = breakfastCatalogMeal;
    }

    public CatalogMeal getLunchCatalogMeal() {
        return lunchCatalogMeal;
    }

    public void setLunchCatalogMeal(CatalogMeal lunchCatalogMeal) {
        this.lunchCatalogMeal = lunchCatalogMeal;
    }

    public CatalogMeal getDinnerCatalogMeal() {
        return dinnerCatalogMeal;
    }

    public void setDinnerCatalogMeal(CatalogMeal dinnerCatalogMeal) {
        this.dinnerCatalogMeal = dinnerCatalogMeal;
    }

    public CatalogMeal getSnackCatalogMeal() {
        return snackCatalogMeal;
    }

    public void setSnackCatalogMeal(CatalogMeal snackCatalogMeal) {
        this.snackCatalogMeal = snackCatalogMeal;
    }
}

