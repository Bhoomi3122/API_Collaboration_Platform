package com.apiplatform.api_platform.apiRequest.service;

import com.apiplatform.api_platform.apiRequest.dto.response.ApiExecutionResponse;
import com.apiplatform.api_platform.apiRequest.entity.ApiRequest;
import com.apiplatform.api_platform.apiRequest.exception.ApiRequestNotFoundException;
import com.apiplatform.api_platform.apiRequest.repository.ApiRequestRepository;
import com.apiplatform.api_platform.auth.entity.User;
import com.apiplatform.api_platform.auth.repository.UserRepository;
import com.apiplatform.api_platform.exception.ResourceNotFoundException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class ApiExecutionService {

    private final RestTemplate restTemplate;
    private final ApiRequestRepository apiRequestRepository;
    private UserRepository userRepository;

    public ApiExecutionService(RestTemplate restTemplate, ApiRequestRepository apiRequestRepository, UserRepository userRepository) {
        this.restTemplate = restTemplate;
        this.apiRequestRepository = apiRequestRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));
    }

    private Map<String, String> extractHeaders(HttpHeaders headers) {

        Map<String, String> result = new HashMap<>();

        if (headers == null) {
            return result;
        }

        headers.forEach((key, value) ->
                result.put(key, String.join(", ", value)));

        return result;
    }

    private ApiRequest getOwnedApiRequest(Long requestId)
    {
        ApiRequest apiRequest = apiRequestRepository.findById(requestId)
                .orElseThrow(() ->
                        new ApiRequestNotFoundException(
                                "API request not found with id: " + requestId
                        ));

        User currentUser = getCurrentUser();

        if (!apiRequest.getCollection()
                .getWorkspace()
                .getOwner()
                .getId()
                .equals(currentUser.getId())) {

            throw new ApiRequestNotFoundException(
                    "API request not found with id: " + requestId
            );
        }

        return apiRequest;
    }

    public ApiExecutionResponse executeRequest(Long requestId)
    {
        ApiRequest apiRequest = getOwnedApiRequest(requestId);
        String method = apiRequest.getMethod();
        String url = apiRequest.getUrl();
        Map<String, String> headers = apiRequest.getHeaders();
        String body = apiRequest.getBody();
        HttpMethod httpMethod = HttpMethod.valueOf(method);
        HttpHeaders httpHeaders = new HttpHeaders();

        if (headers != null && !headers.isEmpty()) {
            for (Map.Entry<String, String> entry : headers.entrySet()) {
                httpHeaders.set(entry.getKey(), entry.getValue());
            }
        }

        HttpEntity<String> httpEntity =
                new HttpEntity<>(body, httpHeaders);
        long startTime = System.currentTimeMillis();
        ResponseEntity<String> response;

        try {
            response = restTemplate.exchange(
                    url,
                    httpMethod,
                    httpEntity,
                    String.class
            );
        }
        catch (HttpStatusCodeException ex) {

            long endTime = System.currentTimeMillis();
            long responseTime = endTime - startTime;

            return new ApiExecutionResponse(
                    ex.getStatusCode().value(),
                    ex.getResponseBodyAsString(),
                    responseTime,
                    extractHeaders(ex.getResponseHeaders())
            );
        }
        long endTime = System.currentTimeMillis();
        long responseTime = endTime - startTime;
        return new ApiExecutionResponse(
                response.getStatusCode().value(),
                response.getBody(),
                responseTime,
                extractHeaders(response.getHeaders())
        );
    }
}