package com.fitmeal.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

@SpringBootApplication
public class FitMealBackendApplication {

    public static void main(String[] args) {
        Map<String, Object> localProperties = loadLocalEnvFile();
        validateLocalConfiguration(localProperties);

        SpringApplication application = new SpringApplication(FitMealBackendApplication.class);
        application.setDefaultProperties(localProperties);
        application.run(args);
    }

    private static Map<String, Object> loadLocalEnvFile() {
        Map<String, Object> properties = new HashMap<>();
        Path envPath = Path.of(".env");

        if (!Files.exists(envPath)) {
            return properties;
        }

        try {
            for (String line : Files.readAllLines(envPath)) {
                String trimmedLine = line.trim();

                if (trimmedLine.isBlank() || trimmedLine.startsWith("#") || !trimmedLine.contains("=")) {
                    continue;
                }

                String[] parts = trimmedLine.split("=", 2);
                String key = parts[0].trim();
                String value = parts[1].trim();

                if (value.length() >= 2 && value.startsWith("\"") && value.endsWith("\"")) {
                    value = value.substring(1, value.length() - 1);
                }

                setDefaultIfMissing(properties, key, value);
            }
        } catch (IOException exception) {
            throw new IllegalStateException("Could not read local .env file", exception);
        }

        return properties;
    }

    private static void setDefaultIfMissing(Map<String, Object> properties, String key, String value) {
        if (value == null) {
            return;
        }

        if (System.getenv(key) == null && System.getProperty(key) == null) {
            properties.put(key, value);
        }
    }

    private static void validateLocalConfiguration(Map<String, Object> localProperties) {
        String dbUrl = getConfigValue("DB_URL", localProperties, "jdbc:postgresql://localhost:5432/mealmate_db");
        String dbUsername = getConfigValue("DB_USERNAME", localProperties, "postgres");
        String dbPassword = getConfigValue("DB_PASSWORD", localProperties, "");
        String jwtSecret = getConfigValue("JWT_SECRET", localProperties, "");

        System.out.println("FitMeal datasource URL: " + dbUrl);
        System.out.println("FitMeal datasource username: " + dbUsername);

        if (dbUrl.startsWith("jdbc:postgresql:") && dbPassword.isBlank()) {
            throw new IllegalStateException("DB_PASSWORD is missing. Add DB_PASSWORD to backend/.env or set it in PowerShell before starting the backend.");
        }

        if (jwtSecret.isBlank() || jwtSecret.length() < 32) {
            throw new IllegalStateException("JWT_SECRET is missing or too short. Add a value of at least 32 characters to backend/.env or set it in PowerShell.");
        }
    }

    private static String getConfigValue(String key, Map<String, Object> localProperties, String defaultValue) {
        String systemPropertyValue = System.getProperty(key);

        if (systemPropertyValue != null && !systemPropertyValue.isBlank()) {
            return systemPropertyValue;
        }

        String environmentValue = System.getenv(key);

        if (environmentValue != null && !environmentValue.isBlank()) {
            return environmentValue;
        }

        Object localValue = localProperties.get(key);

        if (localValue != null && !localValue.toString().isBlank()) {
            return localValue.toString();
        }

        return defaultValue;
    }
}
