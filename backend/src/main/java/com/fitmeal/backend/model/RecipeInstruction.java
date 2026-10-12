package com.fitmeal.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "recipe_instructions")
public class RecipeInstruction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "catalog_meal_id", nullable = false)
    private CatalogMeal catalogMeal;

    @Column(nullable = false)
    private int stepNumber;

    @Column(nullable = false, length = 160)
    private String title;

    @Column(nullable = false, length = 4000)
    private String instruction;

    private Integer estimatedMinutes;

    @Column(length = 500)
    private String safetyNote;

    public RecipeInstruction() {
    }

    public RecipeInstruction(
            int stepNumber,
            String title,
            String instruction,
            Integer estimatedMinutes,
            String safetyNote
    ) {
        this.stepNumber = stepNumber;
        this.title = title;
        this.instruction = instruction;
        this.estimatedMinutes = estimatedMinutes;
        this.safetyNote = safetyNote;
    }

    public Long getId() {
        return id;
    }

    public CatalogMeal getCatalogMeal() {
        return catalogMeal;
    }

    public void setCatalogMeal(CatalogMeal catalogMeal) {
        this.catalogMeal = catalogMeal;
    }

    public int getStepNumber() {
        return stepNumber;
    }

    public void setStepNumber(int stepNumber) {
        this.stepNumber = stepNumber;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getInstruction() {
        return instruction;
    }

    public void setInstruction(String instruction) {
        this.instruction = instruction;
    }

    public Integer getEstimatedMinutes() {
        return estimatedMinutes;
    }

    public void setEstimatedMinutes(Integer estimatedMinutes) {
        this.estimatedMinutes = estimatedMinutes;
    }

    public String getSafetyNote() {
        return safetyNote;
    }

    public void setSafetyNote(String safetyNote) {
        this.safetyNote = safetyNote;
    }
}
