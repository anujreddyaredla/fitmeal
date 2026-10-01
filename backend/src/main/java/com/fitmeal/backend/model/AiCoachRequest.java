package com.fitmeal.backend.model;

import java.util.List;

public class AiCoachRequest {

    private String message;
    private UserProfile profile;
    private List<AiCoachMessage> history;

    public AiCoachRequest() {
    }

    public AiCoachRequest(String message, UserProfile profile, List<AiCoachMessage> history) {
        this.message = message;
        this.profile = profile;
        this.history = history;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public UserProfile getProfile() {
        return profile;
    }

    public void setProfile(UserProfile profile) {
        this.profile = profile;
    }

    public List<AiCoachMessage> getHistory() {
        return history;
    }

    public void setHistory(List<AiCoachMessage> history) {
        this.history = history;
    }
}
