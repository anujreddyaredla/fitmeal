package com.fitmeal.backend.model;

import java.util.List;

public class AiMealRecommendation {

    private Long id;
    private String name;
    private int calories;
    private int protein;
    private List<String> tags;

    public AiMealRecommendation() {
    }

    public AiMealRecommendation(Long id, String name, int calories, int protein, List<String> tags) {
        this.id = id;
        this.name = name;
        this.calories = calories;
        this.protein = protein;
        this.tags = tags;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getCalories() {
        return calories;
    }

    public void setCalories(int calories) {
        this.calories = calories;
    }

    public int getProtein() {
        return protein;
    }

    public void setProtein(int protein) {
        this.protein = protein;
    }

    public List<String> getTags() {
        return tags;
    }

    public void setTags(List<String> tags) {
        this.tags = tags;
    }
}
