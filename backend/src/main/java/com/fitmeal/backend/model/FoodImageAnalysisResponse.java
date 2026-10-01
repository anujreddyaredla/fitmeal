package com.fitmeal.backend.model;

import java.util.List;

public class FoodImageAnalysisResponse {

    private String foodName;
    private int estimatedCalories;
    private int protein;
    private int carbs;
    private int fat;
    private String servingSize;
    private String confidence;
    private List<String> healthyTips;
    private List<String> suggestedAlternatives;

    public FoodImageAnalysisResponse() {
    }

    public FoodImageAnalysisResponse(
            String foodName,
            int estimatedCalories,
            int protein,
            int carbs,
            int fat,
            String servingSize,
            String confidence,
            List<String> healthyTips,
            List<String> suggestedAlternatives
    ) {
        this.foodName = foodName;
        this.estimatedCalories = estimatedCalories;
        this.protein = protein;
        this.carbs = carbs;
        this.fat = fat;
        this.servingSize = servingSize;
        this.confidence = confidence;
        this.healthyTips = healthyTips;
        this.suggestedAlternatives = suggestedAlternatives;
    }

    public String getFoodName() {
        return foodName;
    }

    public void setFoodName(String foodName) {
        this.foodName = foodName;
    }

    public int getEstimatedCalories() {
        return estimatedCalories;
    }

    public void setEstimatedCalories(int estimatedCalories) {
        this.estimatedCalories = estimatedCalories;
    }

    public int getProtein() {
        return protein;
    }

    public void setProtein(int protein) {
        this.protein = protein;
    }

    public int getCarbs() {
        return carbs;
    }

    public void setCarbs(int carbs) {
        this.carbs = carbs;
    }

    public int getFat() {
        return fat;
    }

    public void setFat(int fat) {
        this.fat = fat;
    }

    public String getServingSize() {
        return servingSize;
    }

    public void setServingSize(String servingSize) {
        this.servingSize = servingSize;
    }

    public String getConfidence() {
        return confidence;
    }

    public void setConfidence(String confidence) {
        this.confidence = confidence;
    }

    public List<String> getHealthyTips() {
        return healthyTips;
    }

    public void setHealthyTips(List<String> healthyTips) {
        this.healthyTips = healthyTips;
    }

    public List<String> getSuggestedAlternatives() {
        return suggestedAlternatives;
    }

    public void setSuggestedAlternatives(List<String> suggestedAlternatives) {
        this.suggestedAlternatives = suggestedAlternatives;
    }
}
