package com.fitmeal.backend.controller;

import com.fitmeal.backend.model.WeightEntry;
import com.fitmeal.backend.service.WeightEntryService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/weight-entries")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class WeightEntryController {

    private final WeightEntryService weightEntryService;

    public WeightEntryController(WeightEntryService weightEntryService) {
        this.weightEntryService = weightEntryService;
    }

    @GetMapping
    public List<WeightEntry> getEntries(Authentication authentication) {
        return weightEntryService.getEntries(getUserEmail(authentication));
    }

    @PostMapping
    public WeightEntry addEntry(Authentication authentication, @RequestBody WeightEntry entry) {
        return weightEntryService.addEntry(getUserEmail(authentication), entry);
    }

    @PutMapping("/{id}")
    public WeightEntry updateEntry(
            Authentication authentication,
            @PathVariable Long id,
            @RequestBody WeightEntry updatedEntry
    ) {
        return weightEntryService.updateEntry(getUserEmail(authentication), id, updatedEntry);
    }

    @DeleteMapping("/{id}")
    public void deleteEntry(Authentication authentication, @PathVariable Long id) {
        weightEntryService.deleteEntry(getUserEmail(authentication), id);
    }

    private String getUserEmail(Authentication authentication) {
        return authentication.getName();
    }
}
