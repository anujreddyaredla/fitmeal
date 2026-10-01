package com.fitmeal.backend.service;

import com.fitmeal.backend.model.FoodImageAnalysisResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.Base64;
import java.util.List;
import java.util.Map;

@Service
public class GroqFoodImageAnalyzerClient implements FoodImageAnalyzerClient {

    private static final String GROQ_CHAT_URL =
            "https://api.groq.com/openai/v1/chat/completions";

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;
    private final String groqApiKey;
    private final String groqVisionModel;

    public GroqFoodImageAnalyzerClient(
            ObjectMapper objectMapper,
            @Value("${groq.api.key:}") String groqApiKey,
            @Value("${groq.vision.model:meta-llama/llama-4-scout-17b-16e-instruct}") String groqVisionModel
    ) {
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
        this.groqApiKey = groqApiKey;
        this.groqVisionModel = groqVisionModel;
    }

    @Override
    public FoodImageAnalysisResponse analyze(MultipartFile image) throws Exception {
        if (groqApiKey == null || groqApiKey.isBlank()) {
            throw new IllegalStateException("GROQ_API_KEY is missing");
        }

        String contentType = image.getContentType();
        String base64Image = Base64.getEncoder().encodeToString(image.getBytes());
        String imageDataUrl = "data:" + contentType + ";base64," + base64Image;

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        Map<String, Object> requestBody = Map.of(
                "model", groqVisionModel,
                "messages", List.of(
                        Map.of(
                                "role", "system",
                                "content", "You are FitMeal Vision AI. Return only valid JSON with no markdown."
                        ),
                        Map.of(
                                "role", "user",
                                "content", List.of(
                                        Map.of(
                                                "type", "text",
                                                "text", buildPrompt()
                                        ),
                                        Map.of(
                                                "type", "image_url",
                                                "image_url", Map.of("url", imageDataUrl)
                                        )
                                )
                        )
                ),
                "temperature", 0.2,
                "max_tokens", 800
        );

        ResponseEntity<String> response = restTemplate.postForEntity(
                GROQ_CHAT_URL,
                new HttpEntity<>(requestBody, headers),
                String.class
        );

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new IllegalStateException("Groq Vision returned HTTP status " + response.getStatusCode());
        }

        JsonNode responseJson = objectMapper.readTree(response.getBody());
        JsonNode contentNode = responseJson.path("choices").path(0).path("message").path("content");

        if (!contentNode.isTextual() || contentNode.asText().isBlank()) {
            throw new IllegalStateException("Groq Vision response did not contain message content");
        }

        String jsonContent = removeMarkdownCodeFence(contentNode.asText().trim());
        return objectMapper.readValue(jsonContent, FoodImageAnalysisResponse.class);
    }

    private String buildPrompt() {
        return "Analyze this food image and estimate nutrition. "
                + "Return ONLY this JSON object shape: "
                + "{"
                + "\"foodName\":\"Grilled chicken rice bowl\","
                + "\"estimatedCalories\":650,"
                + "\"protein\":45,"
                + "\"carbs\":70,"
                + "\"fat\":18,"
                + "\"servingSize\":\"1 bowl, about 450g\","
                + "\"confidence\":\"Medium\","
                + "\"healthyTips\":[\"Add vegetables\",\"Choose grilled protein\"],"
                + "\"suggestedAlternatives\":[\"Brown rice bowl\",\"Quinoa chicken bowl\"]"
                + "}. "
                + "Use whole numbers for calories and macros. If uncertain, say Medium or Low confidence.";
    }

    private String removeMarkdownCodeFence(String content) {
        if (!content.startsWith("```")) {
            return content;
        }

        int firstLineEnd = content.indexOf('\n');
        int lastFenceStart = content.lastIndexOf("```");

        if (firstLineEnd < 0 || lastFenceStart <= firstLineEnd) {
            return content;
        }

        return content.substring(firstLineEnd + 1, lastFenceStart).trim();
    }
}
