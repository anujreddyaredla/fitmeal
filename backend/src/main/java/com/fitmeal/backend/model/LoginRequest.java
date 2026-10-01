package com.fitmeal.backend.model;

public class LoginRequest {

    private String usernameOrPhone;
    private String password;

    public LoginRequest() {
    }

    public LoginRequest(String usernameOrPhone, String password) {
        this.usernameOrPhone = usernameOrPhone;
        this.password = password;
    }

    public String getUsernameOrPhone() {
        return usernameOrPhone;
    }

    public void setUsernameOrPhone(String usernameOrPhone) {
        this.usernameOrPhone = usernameOrPhone;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
