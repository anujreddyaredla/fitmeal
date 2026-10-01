package com.fitmeal.backend.repository;

import com.fitmeal.backend.model.GroceryItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GroceryItemRepository extends JpaRepository<GroceryItem, Long> {

    List<GroceryItem> findByOwner_EmailOrderByIdAsc(String ownerEmail);

    Optional<GroceryItem> findByIdAndOwner_Email(Long id, String ownerEmail);
}
