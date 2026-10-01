package com.fitmeal.backend.model;

public class AiRecommendationRequest {

    private String goal;
    private int calories;
    private int proteinTarget;

    public AiRecommendationRequest() {
    }

    public AiRecommendationRequest(String goal, int calories, int proteinTarget) {
        this.goal = goal;
        this.calories = calories;
        this.proteinTarget = proteinTarget;
    }

    public String getGoal() {
        return goal;
    }

    public void setGoal(String goal) {
        this.goal = goal;
    }

    public int getCalories() {
        return calories;
    }

    public void setCalories(int calories) {
        this.calories = calories;
    }

    public int getProteinTarget() {
        return proteinTarget;
    }

    public void setProteinTarget(int proteinTarget) {
        this.proteinTarget = proteinTarget;
    }
}
