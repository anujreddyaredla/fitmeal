package com.fitmeal.backend.repository;

import com.fitmeal.backend.model.Meal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MealRepository extends JpaRepository<Meal, Long> {

    List<Meal> findByOwner_EmailOrderByIdAsc(String ownerEmail);

    Optional<Meal> findByIdAndOwner_Email(Long id, String ownerEmail);

    List<Meal> findByMealTypeIgnoreCaseAndOwner_Email(String mealType, String ownerEmail);
}
