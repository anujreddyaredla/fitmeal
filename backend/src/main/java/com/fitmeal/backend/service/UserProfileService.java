package com.fitmeal.backend.service;

import com.fitmeal.backend.model.UserProfile;
import com.fitmeal.backend.repository.UserProfileRepository;
import org.springframework.stereotype.Service;

@Service
public class UserProfileService {

    private final UserProfileRepository userProfileRepository;

    public UserProfileService(UserProfileRepository userProfileRepository) {
        this.userProfileRepository = userProfileRepository;
    }

    public UserProfile getProfile(String email) {
        return userProfileRepository.findByEmail(email).orElse(null);
    }

    public UserProfile saveOrUpdateProfile(String email, UserProfile profile) {
        UserProfile existingProfile = userProfileRepository.findByEmail(email).orElse(null);

        if (existingProfile == null) {
            profile.setEmail(email);
            return userProfileRepository.save(profile);
        }

        existingProfile.setAge(profile.getAge());
        existingProfile.setHeight(profile.getHeight());
        existingProfile.setWeight(profile.getWeight());
        existingProfile.setGender(profile.getGender());
        existingProfile.setFitnessGoal(profile.getFitnessGoal());
        existingProfile.setDailyCalorieGoal(profile.getDailyCalorieGoal());
        existingProfile.setDailyProteinGoal(profile.getDailyProteinGoal());
        existingProfile.setWaterGoal(profile.getWaterGoal());
        existingProfile.setCurrentStreak(profile.getCurrentStreak());

        return userProfileRepository.save(existingProfile);
    }
}
