package com.fitmeal.backend.model;

import java.util.List;

public class AiCoachResponse {

    private String answer;
    private List<String> suggestions;
    private List<String> tips;

    public AiCoachResponse() {
    }

    public AiCoachResponse(String answer, List<String> suggestions, List<String> tips) {
        this.answer = answer;
        this.suggestions = suggestions;
        this.tips = tips;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public List<String> getSuggestions() {
        return suggestions;
    }

    public void setSuggestions(List<String> suggestions) {
        this.suggestions = suggestions;
    }

    public List<String> getTips() {
        return tips;
    }

    public void setTips(List<String> tips) {
        this.tips = tips;
    }
}
