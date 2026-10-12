package com.fitmeal.backend.repository;

import com.fitmeal.backend.model.CatalogMeal;
import com.fitmeal.backend.model.CatalogMealCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CatalogMealRepository extends JpaRepository<CatalogMeal, Long> {

    Optional<CatalogMeal> findBySlugIgnoreCase(String slug);

    boolean existsBySlugIgnoreCase(String slug);

    @Query(
            value = """
                    select distinct meal
                    from CatalogMeal meal
                    left join meal.ingredients ingredient
                    where (:category is null or meal.category = :category)
                      and (
                          :search is null
                          or lower(meal.name) like lower(concat('%', :search, '%'))
                          or lower(meal.description) like lower(concat('%', :search, '%'))
                          or lower(ingredient.name) like lower(concat('%', :search, '%'))
                      )
                    """,
            countQuery = """
                    select count(distinct meal)
                    from CatalogMeal meal
                    left join meal.ingredients ingredient
                    where (:category is null or meal.category = :category)
                      and (
                          :search is null
                          or lower(meal.name) like lower(concat('%', :search, '%'))
                          or lower(meal.description) like lower(concat('%', :search, '%'))
                          or lower(ingredient.name) like lower(concat('%', :search, '%'))
                      )
                    """
    )
    Page<CatalogMeal> search(
            @Param("category") CatalogMealCategory category,
            @Param("search") String search,
            Pageable pageable
    );
}
