package com.fitmeal.backend.controller;

import com.fitmeal.backend.model.AiCoachRequest;
import com.fitmeal.backend.model.AiCoachResponse;
import com.fitmeal.backend.service.AiCoachService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class AiCoachController {

    private final AiCoachService aiCoachService;

    public AiCoachController(AiCoachService aiCoachService) {
        this.aiCoachService = aiCoachService;
    }

    @PostMapping("/api/ai/coach")
    public AiCoachResponse chat(@RequestBody AiCoachRequest request) {
        return aiCoachService.chat(request);
    }
}
