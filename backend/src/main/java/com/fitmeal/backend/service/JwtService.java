package com.fitmeal.backend.service;

import com.fitmeal.backend.model.AppUser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

@Service
public class JwtService {

    private static final long EXPIRATION_SECONDS = 24 * 60 * 60;

    private final String secret;

    public JwtService(@Value("${jwt.secret}") String secret) {
        if (secret == null || secret.isBlank() || secret.length() < 32) {
            throw new IllegalStateException(
                    "JWT_SECRET must be configured with at least 32 characters"
            );
        }

        this.secret = secret;
    }

    public String generateToken(AppUser user) {
        String headerJson = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
        String payloadJson = "{"
                + "\"sub\":\"" + escapeJson(user.getEmail()) + "\","
                + "\"firstName\":\"" + escapeJson(user.getFirstName()) + "\","
                + "\"lastName\":\"" + escapeJson(user.getLastName()) + "\","
                + "\"role\":\"" + escapeJson(user.getRole()) + "\","
                + "\"exp\":" + Instant.now().plusSeconds(EXPIRATION_SECONDS).getEpochSecond()
                + "}";

        String header = base64Url(headerJson);
        String payload = base64Url(payloadJson);
        String signature = sign(header + "." + payload);

        return header + "." + payload + "." + signature;
    }

    public boolean validateToken(String token) {
        try {
            String[] parts = getTokenParts(token);

            if (parts == null) {
                return false;
            }

            String expectedSignature = sign(parts[0] + "." + parts[1]);

            if (!expectedSignature.equals(parts[2])) {
                return false;
            }

            Long expiration = extractLongClaim(token, "exp");

            return expiration != null && expiration > Instant.now().getEpochSecond();
        } catch (Exception exception) {
            return false;
        }
    }

    public String extractEmail(String token) {
        return extractStringClaim(token, "sub");
    }

    private String[] getTokenParts(String token) {
        if (token == null) {
            return null;
        }

        String[] parts = token.split("\\.");

        if (parts.length != 3) {
            return null;
        }

        return parts;
    }

    private String extractStringClaim(String token, String claimName) {
        String payload = getPayloadJson(token);

        if (payload == null) {
            return null;
        }

        String searchText = "\"" + claimName + "\":\"";
        int start = payload.indexOf(searchText);

        if (start == -1) {
            return null;
        }

        start = start + searchText.length();
        int end = payload.indexOf("\"", start);

        if (end == -1) {
            return null;
        }

        return payload.substring(start, end);
    }

    private Long extractLongClaim(String token, String claimName) {
        String payload = getPayloadJson(token);

        if (payload == null) {
            return null;
        }

        String searchText = "\"" + claimName + "\":";
        int start = payload.indexOf(searchText);

        if (start == -1) {
            return null;
        }

        start = start + searchText.length();
        int end = payload.indexOf(",", start);

        if (end == -1) {
            end = payload.indexOf("}", start);
        }

        if (end == -1) {
            return null;
        }

        return Long.parseLong(payload.substring(start, end));
    }

    private String getPayloadJson(String token) {
        String[] parts = getTokenParts(token);

        if (parts == null) {
            return null;
        }

        return new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
    }

    private String base64Url(String value) {
        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private String sign(String value) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            mac.init(secretKey);

            return Base64.getUrlEncoder()
                    .withoutPadding()
                    .encodeToString(mac.doFinal(value.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception exception) {
            throw new IllegalStateException("Could not sign JWT", exception);
        }
    }

    private String escapeJson(String value) {
        if (value == null) {
            return "";
        }

        return value.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}

