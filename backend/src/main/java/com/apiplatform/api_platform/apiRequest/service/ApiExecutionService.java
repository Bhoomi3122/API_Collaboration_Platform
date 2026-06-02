package com.apiplatform.api_platform.apiRequest.service;

import com.apiplatform.api_platform.apiRequest.dto.response.ApiExecutionResponse;
import com.apiplatform.api_platform.apiRequest.entity.ApiRequest;
import com.apiplatform.api_platform.apiRequest.exception.ApiRequestNotFoundException;
import com.apiplatform.api_platform.apiRequest.repository.ApiRequestRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class ApiExecutionService {

    private final RestTemplate restTemplate;
    private final ApiRequestRepository apiRequestRepository;
    private final ObjectMapper objectMapper;

    public ApiExecutionService(RestTemplate restTemplate, ApiRequestRepository apiRequestRepository, ObjectMapper objectMapper) {
        this.restTemplate = restTemplate;
        this.apiRequestRepository = apiRequestRepository;
        this.objectMapper = objectMapper;
    }

    private ApiRequest getApiRequest(Long requestId)
    {
        return apiRequestRepository.findById(requestId)
                .orElseThrow(() ->
                        new ApiRequestNotFoundException(
                                "API request not found with id: " + requestId
                        ));
    }

    public ApiExecutionResponse executeRequest(Long requestId)
    {
        ApiRequest apiRequest = getApiRequest(requestId);
        String method = apiRequest.getMethod();
        String url = apiRequest.getUrl();
        String headers = apiRequest.getHeaders();
        String body = apiRequest.getBody();
        HttpMethod httpMethod = HttpMethod.valueOf(method);
        HttpHeaders httpHeaders = new HttpHeaders();
        Map<String, String> headerMap = new HashMap<>();
        if (headers != null && !headers.isBlank()) {
            try {
                headerMap = objectMapper.readValue(
                        headers,
                        new TypeReference<Map<String, String>>() {}
                );
            } catch (Exception e) {
                throw new RuntimeException("Invalid headers JSON format");
            }
        }
        for (Map.Entry<String, String> entry : headerMap.entrySet()) {
            httpHeaders.set(entry.getKey(), entry.getValue());
        }
        HttpEntity<String> httpEntity =
                new HttpEntity<>(body, httpHeaders);
        long startTime = System.currentTimeMillis();
        ResponseEntity<String> response =
                restTemplate.exchange(
                        url,
                        httpMethod,
                        httpEntity,
                        String.class
                );
        long endTime = System.currentTimeMillis();
        long responseTime = endTime - startTime;
        return new ApiExecutionResponse(
                response.getStatusCode().value(),
                response.getBody(),
                responseTime
        );
    }
}