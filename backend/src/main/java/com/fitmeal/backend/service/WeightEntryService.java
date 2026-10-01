package com.fitmeal.backend.service;

import com.fitmeal.backend.model.WeightEntry;
import com.fitmeal.backend.repository.WeightEntryRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class WeightEntryService {

    private final WeightEntryRepository weightEntryRepository;

    public WeightEntryService(WeightEntryRepository weightEntryRepository) {
        this.weightEntryRepository = weightEntryRepository;
    }

    public List<WeightEntry> getEntries(String userEmail) {
        return weightEntryRepository.findByUserEmailOrderByRecordedDateAscCreatedAtAsc(userEmail);
    }

    public WeightEntry addEntry(String userEmail, WeightEntry entry) {
        entry.setId(null);
        entry.setUserEmail(userEmail);

        if (entry.getRecordedDate() == null) {
            entry.setRecordedDate(LocalDate.now());
        }

        entry.setCreatedAt(LocalDateTime.now());
        return weightEntryRepository.save(entry);
    }

    public WeightEntry updateEntry(String userEmail, Long id, WeightEntry updatedEntry) {
        WeightEntry existingEntry = weightEntryRepository.findByIdAndUserEmail(id, userEmail).orElse(null);

        if (existingEntry == null) {
            return null;
        }

        existingEntry.setWeight(updatedEntry.getWeight());

        if (updatedEntry.getRecordedDate() != null) {
            existingEntry.setRecordedDate(updatedEntry.getRecordedDate());
        }

        return weightEntryRepository.save(existingEntry);
    }

    public void deleteEntry(String userEmail, Long id) {
        WeightEntry existingEntry = weightEntryRepository.findByIdAndUserEmail(id, userEmail).orElse(null);

        if (existingEntry != null) {
            weightEntryRepository.delete(existingEntry);
        }
    }
}
