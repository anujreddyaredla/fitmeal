package com.fitmeal.backend.repository;

import com.fitmeal.backend.model.WeightEntry;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WeightEntryRepository extends JpaRepository<WeightEntry, Long> {

    List<WeightEntry> findByUserEmailOrderByRecordedDateAscCreatedAtAsc(String userEmail);

    Optional<WeightEntry> findByIdAndUserEmail(Long id, String userEmail);
}
