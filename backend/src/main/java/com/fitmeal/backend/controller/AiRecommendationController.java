package com.fitmeal.backend.controller;

import com.fitmeal.backend.model.AiMealRecommendation;
import com.fitmeal.backend.model.AiRecommendationRequest;
import com.fitmeal.backend.service.AiRecommendationService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
@RestController
public class AiRecommendationController {

    private final AiRecommendationService aiRecommendationService;

    public AiRecommendationController(AiRecommendationService aiRecommendationService) {
        this.aiRecommendationService = aiRecommendationService;
    }

    @PostMapping("/api/ai/recommendations")
    public List<AiMealRecommendation> getRecommendations(@RequestBody AiRecommendationRequest request) {
        return aiRecommendationService.getRecommendations(request);
    }
}

