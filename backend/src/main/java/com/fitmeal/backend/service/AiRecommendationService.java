package com.fitmeal.backend.service;

import com.fitmeal.backend.model.AiMealRecommendation;
import com.fitmeal.backend.model.AiRecommendationRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AiRecommendationService {

    private static final Logger logger = LoggerFactory.getLogger(AiRecommendationService.class);
    private static final String GROQ_CHAT_URL =
            "https://api.groq.com/openai/v1/chat/completions";

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;
    private final String groqApiKey;
    private final String groqModel;

    public AiRecommendationService(
            ObjectMapper objectMapper,
            @Value("${groq.api.key:}") String groqApiKey,
            @Value("${groq.model:llama-3.1-8b-instant}") String groqModel
    ) {
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
        this.groqApiKey = groqApiKey;
        this.groqModel = groqModel;
    }

    public List<AiMealRecommendation> getRecommendations(AiRecommendationRequest request) {
        if (request == null) {
            request = new AiRecommendationRequest();
        }

        String goal = request.getGoal();
        int calories = request.getCalories();
        int proteinTarget = request.getProteinTarget();

        if (goal == null || goal.isBlank()) {
            goal = "Maintenance";
        }

        if (calories <= 0) {
            calories = 2000;
        }

        if (proteinTarget <= 0) {
            proteinTarget = 100;
        }

        AiRecommendationRequest normalizedRequest =
                new AiRecommendationRequest(goal, calories, proteinTarget);

        if (groqApiKey == null || groqApiKey.isBlank()) {
            logger.warn("Groq failed using fallback: GROQ_API_KEY is missing");
            return getFallbackRecommendations(normalizedRequest);
        }

        try {
            logger.info("Groq request started");

            List<AiMealRecommendation> recommendations =
                    requestGroqRecommendations(normalizedRequest);

            logger.info("Groq success");
            return recommendations;
        } catch (Exception exception) {
            logger.error("Groq failed using fallback: {}", exception.getMessage(), exception);
            return getFallbackRecommendations(normalizedRequest);
        }
    }

    private List<AiMealRecommendation> requestGroqRecommendations(
            AiRecommendationRequest request
    ) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        Map<String, Object> requestBody = Map.of(
                "model", groqModel,
                "messages", List.of(
                        Map.of(
                                "role", "system",
                                "content",
                                "You are a nutrition meal-planning assistant. "
                                        + "Return only a valid JSON array with no markdown, "
                                        + "code fences, or explanation."
                        ),
                        Map.of(
                                "role", "user",
                                "content", buildPrompt(request)
                        )
                ),
                "temperature", 0.7,
                "max_tokens", 900
        );

        ResponseEntity<String> response = restTemplate.postForEntity(
                GROQ_CHAT_URL,
                new HttpEntity<>(requestBody, headers),
                String.class
        );

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new IllegalStateException(
                    "Groq returned HTTP status " + response.getStatusCode()
            );
        }

        JsonNode responseJson = objectMapper.readTree(response.getBody());
        JsonNode contentNode = responseJson.path("choices").path(0).path("message").path("content");

        if (!contentNode.isTextual() || contentNode.asText().isBlank()) {
            throw new IllegalStateException("Groq response did not contain message content");
        }

        String jsonContent = removeMarkdownCodeFence(contentNode.asText().trim());
        List<AiMealRecommendation> recommendations = objectMapper.readValue(
                jsonContent,
                new TypeReference<List<AiMealRecommendation>>() {
                }
        );

        if (recommendations.size() != 4) {
            throw new IllegalStateException("Groq did not return exactly 4 recommendations");
        }

        return recommendations;
    }

    private String buildPrompt(AiRecommendationRequest request) {
        return """
                Generate exactly 4 healthy meal recommendations for this user:
                - Fitness goal: %s
                - Daily calorie target: %d calories
                - Daily protein target: %d grams

                Make each meal practical and nutritionally appropriate for the targets.
                Include both vegetarian and non-vegetarian options when appropriate.
                Each recommendation must include:
                - id as a number from 1 to 4
                - name
                - calories as a whole number
                - protein in grams as a whole number
                - tags as an array of 2 or 3 short strings

                Return ONLY this valid JSON array format:
                [
                  {
                    "id": 1,
                    "name": "Grilled Chicken Rice Bowl",
                    "calories": 620,
                    "protein": 48,
                    "tags": ["High Protein", "Balanced", "Muscle Gain"]
                  }
                ]
                """.formatted(
                request.getGoal(),
                request.getCalories(),
                request.getProteinTarget()
        );
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

    private List<AiMealRecommendation> getFallbackRecommendations(
            AiRecommendationRequest request
    ) {
        String goal = request.getGoal();
        int calories = request.getCalories();
        int proteinTarget = request.getProteinTarget();
        int mealCalories = calories / 4;
        int mealProtein = proteinTarget / 4;

        if (goal.equalsIgnoreCase("Weight Loss")) {
            mealCalories = Math.max(mealCalories - 150, 250);
            mealProtein = Math.max(mealProtein, 25);
        } else if (goal.equalsIgnoreCase("Muscle Gain")) {
            mealCalories = mealCalories + 150;
            mealProtein = mealProtein + 15;
        } else if (goal.equalsIgnoreCase("High Protein")) {
            mealProtein = mealProtein + 25;
        }

        List<AiMealRecommendation> recommendations = new ArrayList<>();

        recommendations.add(new AiMealRecommendation(
                1L,
                "Grilled Chicken Bowl",
                mealCalories,
                mealProtein,
                getTagsForGoal(goal, "High Protein")
        ));

        recommendations.add(new AiMealRecommendation(
                2L,
                "Greek Yogurt Oats",
                Math.max(mealCalories - 120, 250),
                Math.max(mealProtein - 8, 20),
                getTagsForGoal(goal, "Meal Prep")
        ));

        recommendations.add(new AiMealRecommendation(
                3L,
                "Avocado Egg Toast",
                Math.max(mealCalories - 80, 300),
                Math.max(mealProtein - 12, 18),
                getTagsForGoal(goal, "Healthy Fat")
        ));

        recommendations.add(new AiMealRecommendation(
                4L,
                "Salmon Rice Bowl",
                mealCalories + 90,
                mealProtein + 8,
                getTagsForGoal(goal, "Omega Rich")
        ));

        return recommendations;
    }

    private List<String> getTagsForGoal(String goal, String extraTag) {
        List<String> tags = new ArrayList<>();

        if (goal.equalsIgnoreCase("Weight Loss")) {
            tags.add("Weight Loss");
            tags.add("Low Carb");
        } else if (goal.equalsIgnoreCase("Muscle Gain")) {
            tags.add("Muscle Gain");
            tags.add("High Protein");
        } else if (goal.equalsIgnoreCase("High Protein")) {
            tags.add("High Protein");
            tags.add("Protein Focused");
        } else {
            tags.add("Maintenance");
            tags.add("Balanced");
        }

        tags.add(extraTag);
        return tags;
    }
}
