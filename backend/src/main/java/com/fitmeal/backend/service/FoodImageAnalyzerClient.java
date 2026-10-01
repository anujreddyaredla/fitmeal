package com.fitmeal.backend.service;

import com.fitmeal.backend.model.FoodImageAnalysisResponse;
import org.springframework.web.multipart.MultipartFile;

public interface FoodImageAnalyzerClient {

    FoodImageAnalysisResponse analyze(MultipartFile image) throws Exception;
}
