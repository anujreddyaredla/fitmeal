package com.fitmeal.backend.repository;

import com.fitmeal.backend.model.MealPlan;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MealPlanRepository extends JpaRepository<MealPlan, Long> {

    List<MealPlan> findByOwner_EmailOrderByIdAsc(String ownerEmail);

    Optional<MealPlan> findByIdAndOwner_Email(Long id, String ownerEmail);
}
