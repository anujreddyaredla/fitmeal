package com.fitmeal.backend.controller;

import com.fitmeal.backend.model.WelcomeResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/api/hello")
    public WelcomeResponse hello() {

        return new WelcomeResponse(
                "Welcome to FitMeal",
                "success"
        );
    }
}
