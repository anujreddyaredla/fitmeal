package com.fitmeal.backend.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "catalog_meals")
public class CatalogMeal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 120)
    private String slug;

    @Column(nullable = false, length = 160)
    private String name;

    @Column(nullable = false, length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CatalogMealCategory category;

    @Column(nullable = false, length = 500)
    private String imagePath;

    @Column(nullable = false, length = 100)
    private String servingSize;

    @Column(nullable = false)
    private int calories;

    @Column(nullable = false)
    private int protein;

    @Column(nullable = false)
    private int carbohydrates;

    @Column(nullable = false)
    private int fat;

    @Column(nullable = false)
    private int fiber;

    @Column(nullable = false)
    private int prepMinutes;

    @Column(nullable = false)
    private int cookMinutes;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "catalog_meal_tags", joinColumns = @JoinColumn(name = "catalog_meal_id"))
    @Column(name = "tag", nullable = false, length = 80)
    @OrderColumn(name = "display_order")
    private List<String> dietaryTags = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "catalog_meal_equipment", joinColumns = @JoinColumn(name = "catalog_meal_id"))
    @Column(name = "equipment", nullable = false, length = 120)
    @OrderColumn(name = "display_order")
    private List<String> equipment = new ArrayList<>();

    @OneToMany(mappedBy = "catalogMeal", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    private List<CatalogIngredient> ingredients = new ArrayList<>();

    @OneToMany(mappedBy = "catalogMeal", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("stepNumber ASC")
    private List<RecipeInstruction> instructions = new ArrayList<>();

    public CatalogMeal() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public CatalogMealCategory getCategory() {
        return category;
    }

    public void setCategory(CatalogMealCategory category) {
        this.category = category;
    }

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }

    public String getServingSize() {
        return servingSize;
    }

    public void setServingSize(String servingSize) {
        this.servingSize = servingSize;
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

    public int getCarbohydrates() {
        return carbohydrates;
    }

    public void setCarbohydrates(int carbohydrates) {
        this.carbohydrates = carbohydrates;
    }

    public int getFat() {
        return fat;
    }

    public void setFat(int fat) {
        this.fat = fat;
    }

    public int getFiber() {
        return fiber;
    }

    public void setFiber(int fiber) {
        this.fiber = fiber;
    }

    public int getPrepMinutes() {
        return prepMinutes;
    }

    public void setPrepMinutes(int prepMinutes) {
        this.prepMinutes = prepMinutes;
    }

    public int getCookMinutes() {
        return cookMinutes;
    }

    public void setCookMinutes(int cookMinutes) {
        this.cookMinutes = cookMinutes;
    }

    public List<String> getDietaryTags() {
        return dietaryTags;
    }

    public void setDietaryTags(List<String> dietaryTags) {
        this.dietaryTags = dietaryTags == null ? new ArrayList<>() : dietaryTags;
    }

    public List<String> getEquipment() {
        return equipment;
    }

    public void setEquipment(List<String> equipment) {
        this.equipment = equipment == null ? new ArrayList<>() : equipment;
    }

    public List<CatalogIngredient> getIngredients() {
        return ingredients;
    }

    public void setIngredients(List<CatalogIngredient> ingredients) {
        this.ingredients.clear();
        if (ingredients != null) {
            ingredients.forEach(this::addIngredient);
        }
    }

    public void addIngredient(CatalogIngredient ingredient) {
        ingredient.setCatalogMeal(this);
        ingredients.add(ingredient);
    }

    public List<RecipeInstruction> getInstructions() {
        return instructions;
    }

    public void setInstructions(List<RecipeInstruction> instructions) {
        this.instructions.clear();
        if (instructions != null) {
            instructions.forEach(this::addInstruction);
        }
    }

    public void addInstruction(RecipeInstruction instruction) {
        instruction.setCatalogMeal(this);
        instructions.add(instruction);
    }
}
