package com.fitmeal.backend.service;

import com.fitmeal.backend.model.AiCoachMessage;
import com.fitmeal.backend.model.AiCoachRequest;
import com.fitmeal.backend.model.AiCoachResponse;
import com.fitmeal.backend.model.UserProfile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class AiCoachService {

    private static final Logger logger = LoggerFactory.getLogger(AiCoachService.class);
    private static final String GROQ_CHAT_URL =
            "https://api.groq.com/openai/v1/chat/completions";

    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;
    private final String groqApiKey;
    private final String groqModel;

    public AiCoachService(
            ObjectMapper objectMapper,
            @Value("${groq.api.key:}") String groqApiKey,
            @Value("${groq.model:llama-3.1-8b-instant}") String groqModel
    ) {
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
        this.groqApiKey = groqApiKey;
        this.groqModel = groqModel;
    }

    public AiCoachResponse chat(AiCoachRequest request) {
        if (request == null || isBlank(request.getMessage())) {
            return new AiCoachResponse(
                    "Ask me anything about meals, calories, protein, hydration, groceries, or meal prep.",
                    List.of("Plan today's meals", "Suggest a high protein snack"),
                    List.of("Add your profile goals first for more personalized coaching.")
            );
        }

        if (groqApiKey == null || groqApiKey.isBlank()) {
            logger.warn("Groq coach failed using fallback: GROQ_API_KEY is missing");
            return getFallbackResponse(request);
        }

        try {
            logger.info("Groq coach request started");
            AiCoachResponse response = requestGroqCoachResponse(request);
            logger.info("Groq coach success");
            return response;
        } catch (Exception exception) {
            logger.error("Groq coach failed using fallback: {}", exception.getMessage(), exception);
            return getFallbackResponse(request);
        }
    }

    private AiCoachResponse requestGroqCoachResponse(AiCoachRequest request) throws Exception {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(groqApiKey);

        Map<String, Object> requestBody = Map.of(
                "model", groqModel,
                "messages", buildMessages(request),
                "temperature", 0.6,
                "max_tokens", 900
        );

        ResponseEntity<String> response = restTemplate.postForEntity(
                GROQ_CHAT_URL,
                new HttpEntity<>(requestBody, headers),
                String.class
        );

        if (!response.getStatusCode().is2xxSuccessful() || response.getBody() == null) {
            throw new IllegalStateException("Groq returned HTTP status " + response.getStatusCode());
        }

        JsonNode responseJson = objectMapper.readTree(response.getBody());
        JsonNode contentNode = responseJson.path("choices").path(0).path("message").path("content");

        if (!contentNode.isTextual() || contentNode.asText().isBlank()) {
            throw new IllegalStateException("Groq response did not contain coach content");
        }

        String content = removeMarkdownCodeFence(contentNode.asText().trim());
        AiCoachResponse coachResponse = objectMapper.readValue(content, AiCoachResponse.class);

        if (isBlank(coachResponse.getAnswer())) {
            throw new IllegalStateException("Groq coach response did not include an answer");
        }

        if (coachResponse.getSuggestions() == null) {
            coachResponse.setSuggestions(List.of());
        }

        if (coachResponse.getTips() == null) {
            coachResponse.setTips(List.of());
        }

        return coachResponse;
    }

    private List<Map<String, String>> buildMessages(AiCoachRequest request) {
        List<Map<String, String>> messages = new ArrayList<>();

        messages.add(Map.of(
                "role", "system",
                "content",
                "You are FitMeal AI Coach, a friendly nutrition coach. "
                        + "Give practical, safe, beginner-friendly nutrition guidance. "
                        + "Do not diagnose medical conditions. Encourage a professional for medical concerns. "
                        + "Return ONLY valid JSON with keys: answer, suggestions, tips. "
                        + "answer is a short helpful response. suggestions and tips are string arrays."
        ));

        messages.add(Map.of("role", "user", "content", buildProfileContext(request.getProfile())));

        if (request.getHistory() != null) {
            request.getHistory().stream()
                    .filter(message -> message != null && !isBlank(message.getContent()))
                    .limit(10)
                    .forEach(message -> messages.add(Map.of(
                            "role", normalizeRole(message.getRole()),
                            "content", message.getContent()
                    )));
        }

        messages.add(Map.of("role", "user", "content", request.getMessage()));
        return messages;
    }

    private String buildProfileContext(UserProfile profile) {
        if (profile == null) {
            return "User profile is not complete yet. Give general healthy nutrition guidance.";
        }

        return "User profile context: "
                + "age=" + profile.getAge()
                + ", heightCm=" + profile.getHeight()
                + ", weightKg=" + profile.getWeight()
                + ", gender=" + safeText(profile.getGender())
                + ", fitnessGoal=" + safeText(profile.getFitnessGoal())
                + ", dailyCalorieGoal=" + profile.getDailyCalorieGoal()
                + ", dailyProteinGoal=" + profile.getDailyProteinGoal()
                + ", waterGoalMl=" + profile.getWaterGoal()
                + ". Personalize advice around these goals.";
    }

    private String normalizeRole(String role) {
        if ("assistant".equalsIgnoreCase(role) || "ai".equalsIgnoreCase(role)) {
            return "assistant";
        }

        return "user";
    }

    private AiCoachResponse getFallbackResponse(AiCoachRequest request) {
        UserProfile profile = request.getProfile();
        String goal = profile == null || isBlank(profile.getFitnessGoal())
                ? "your goal"
                : profile.getFitnessGoal();
        int calories = profile == null ? 0 : profile.getDailyCalorieGoal();
        int protein = profile == null ? 0 : profile.getDailyProteinGoal();

        String answer = "Here is a FitMeal coach suggestion for " + goal + ": "
                + "build each meal around a lean protein, a fiber-rich carb, colorful vegetables, "
                + "and a small healthy fat. "
                + (calories > 0 ? "Aim near " + calories + " calories today. " : "")
                + (protein > 0 ? "Try to reach about " + protein + "g protein. " : "")
                + "For your question: " + request.getMessage();

        return new AiCoachResponse(
                answer,
                List.of(
                        "Greek yogurt oats with banana",
                        "Grilled chicken rice bowl",
                        "Paneer or tofu veggie bowl",
                        "Egg avocado toast"
                ),
                List.of(
                        "Drink water consistently through the day.",
                        "Add protein to every meal or snack.",
                        "Prep 2 or 3 base ingredients to make healthy choices easier."
                )
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

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String safeText(String value) {
        return value == null ? "" : value;
    }
}
