package com.fitmeal.backend.service;

import com.fitmeal.backend.model.FoodImageAnalysisResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class FoodImageAnalysisService {

    private static final Logger logger = LoggerFactory.getLogger(FoodImageAnalysisService.class);

    private final FoodImageAnalyzerClient foodImageAnalyzerClient;

    public FoodImageAnalysisService(FoodImageAnalyzerClient foodImageAnalyzerClient) {
        this.foodImageAnalyzerClient = foodImageAnalyzerClient;
    }

    public FoodImageAnalysisResponse analyzeFoodImage(MultipartFile image) {
        if (!isSupportedImage(image)) {
            return new FoodImageAnalysisResponse(
                    "Invalid image",
                    0,
                    0,
                    0,
                    0,
                    "Not available",
                    "Low",
                    List.of("Please upload a JPG, JPEG, or PNG food image."),
                    List.of("Try a clear photo with the full plate visible.")
            );
        }

        try {
            logger.info("Food image analysis started");
            FoodImageAnalysisResponse response = foodImageAnalyzerClient.analyze(image);
            logger.info("Food image analysis completed");
            return normalizeResponse(response);
        } catch (Exception exception) {
            logger.error("Food image analysis failed using fallback: {}", exception.getMessage(), exception);
            return getFallbackResponse();
        }
    }

    private boolean isSupportedImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            return false;
        }

        String contentType = image.getContentType();
        if (contentType == null) {
            return false;
        }

        return contentType.equalsIgnoreCase("image/jpeg")
                || contentType.equalsIgnoreCase("image/jpg")
                || contentType.equalsIgnoreCase("image/png");
    }

    private FoodImageAnalysisResponse normalizeResponse(FoodImageAnalysisResponse response) {
        if (response == null) {
            return getFallbackResponse();
        }

        if (response.getFoodName() == null || response.getFoodName().isBlank()) {
            response.setFoodName("Food plate");
        }

        if (response.getServingSize() == null || response.getServingSize().isBlank()) {
            response.setServingSize("Estimated from image");
        }

        if (response.getConfidence() == null || response.getConfidence().isBlank()) {
            response.setConfidence("Medium");
        }

        if (response.getHealthyTips() == null) {
            response.setHealthyTips(List.of());
        }

        if (response.getSuggestedAlternatives() == null) {
            response.setSuggestedAlternatives(List.of());
        }

        return response;
    }

    private FoodImageAnalysisResponse getFallbackResponse() {
        return new FoodImageAnalysisResponse(
                "Food image analysis unavailable",
                0,
                0,
                0,
                0,
                "Upload received",
                "Low",
                List.of(
                        "Vision AI is not configured or temporarily unavailable.",
                        "Add a clear plate photo and try again after configuring a vision model."
                ),
                List.of(
                        "Log this meal manually for now.",
                        "Use grilled protein, whole grains, and vegetables for a balanced plate."
                )
        );
    }
}
