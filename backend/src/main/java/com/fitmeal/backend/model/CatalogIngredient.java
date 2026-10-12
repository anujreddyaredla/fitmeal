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
@Table(name = "catalog_ingredients")
public class CatalogIngredient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "catalog_meal_id", nullable = false)
    private CatalogMeal catalogMeal;

    @Column(nullable = false)
    private int displayOrder;

    @Column(nullable = false, length = 40)
    private String quantity;

    @Column(length = 40)
    private String unit;

    @Column(nullable = false, length = 160)
    private String name;

    @Column(length = 300)
    private String preparationNote;

    public CatalogIngredient() {
    }

    public CatalogIngredient(int displayOrder, String quantity, String unit, String name, String preparationNote) {
        this.displayOrder = displayOrder;
        this.quantity = quantity;
        this.unit = unit;
        this.name = name;
        this.preparationNote = preparationNote;
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

    public int getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(int displayOrder) {
        this.displayOrder = displayOrder;
    }

    public String getQuantity() {
        return quantity;
    }

    public void setQuantity(String quantity) {
        this.quantity = quantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPreparationNote() {
        return preparationNote;
    }

    public void setPreparationNote(String preparationNote) {
        this.preparationNote = preparationNote;
    }
}
