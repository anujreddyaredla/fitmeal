package com.fitmeal.backend.controller;

import com.fitmeal.backend.model.FoodImageAnalysisResponse;
import com.fitmeal.backend.service.FoodImageAnalysisService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class FoodImageAnalysisController {

    private final FoodImageAnalysisService foodImageAnalysisService;

    public FoodImageAnalysisController(FoodImageAnalysisService foodImageAnalysisService) {
        this.foodImageAnalysisService = foodImageAnalysisService;
    }

    @PostMapping("/api/ai/analyze-food")
    public FoodImageAnalysisResponse analyzeFood(@RequestParam("image") MultipartFile image) {
        return foodImageAnalysisService.analyzeFoodImage(image);
    }
}
