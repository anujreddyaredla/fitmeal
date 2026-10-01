package com.fitmeal.backend.controller;

import com.fitmeal.backend.model.UserProfile;
import com.fitmeal.backend.service.UserProfileService;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
@RestController
@RequestMapping("/api/profile")
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping("/me")
    public UserProfile getProfile(Authentication authentication) {
        return userProfileService.getProfile(authentication.getName());
    }

    @PostMapping("/me")
    public UserProfile saveOrUpdateProfile(Authentication authentication, @RequestBody UserProfile profile) {
        return userProfileService.saveOrUpdateProfile(authentication.getName(), profile);
    }
}

