package com.fitmeal.backend.model;

public class WelcomeResponse {

    private String message;
    private String status;

    public WelcomeResponse(String message, String status) {
        this.message = message;
        this.status = status;
    }

    public String getMessage() {
        return message;
    }

    public String getStatus() {
        return status;
    }
}
