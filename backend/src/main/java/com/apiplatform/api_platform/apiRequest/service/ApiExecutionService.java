package com.apiplatform.api_platform.apiRequest.service;

import com.apiplatform.api_platform.apiRequest.dto.request.AdHocExecuteRequest;
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

import java.util.Base64;
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

        // Apply saved auth from the entity (mirrors what executeAdHocRequest does)
        AdHocExecuteRequest entityAuth = new AdHocExecuteRequest();
        entityAuth.setAuthType(apiRequest.getAuthType());
        entityAuth.setAuthToken(apiRequest.getAuthToken());
        entityAuth.setAuthUsername(apiRequest.getAuthUsername());
        entityAuth.setAuthPassword(apiRequest.getAuthPassword());
        entityAuth.setAuthApiKeyName(apiRequest.getAuthApiKeyName());
        entityAuth.setAuthApiKeyValue(apiRequest.getAuthApiKeyValue());
        applyAuth(entityAuth, httpHeaders);

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
        catch (Exception ex) {
            // Network error, DNS failure, timeout, etc.
            long endTime = System.currentTimeMillis();
            long responseTime = endTime - startTime;
            return new ApiExecutionResponse(
                    0,
                    "Request failed: " + ex.getMessage(),
                    responseTime,
                    new HashMap<>()
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

    /**
     * Apply authorization headers derived from the AdHocExecuteRequest auth fields.
     * Auth settings are applied AFTER explicit headers so they take priority.
     */
    private void applyAuth(AdHocExecuteRequest req, HttpHeaders httpHeaders) {
        if (req.getAuthType() == null || req.getAuthType().isBlank()
                || req.getAuthType().equalsIgnoreCase("NONE")) {
            return;
        }

        switch (req.getAuthType().toUpperCase()) {
            case "BEARER_TOKEN":
                if (req.getAuthToken() != null && !req.getAuthToken().isBlank()) {
                    httpHeaders.set("Authorization", "Bearer " + req.getAuthToken());
                }
                break;

            case "BASIC_AUTH":
                if (req.getAuthUsername() != null && req.getAuthPassword() != null) {
                    String credentials = req.getAuthUsername() + ":" + req.getAuthPassword();
                    String encoded = Base64.getEncoder()
                            .encodeToString(credentials.getBytes());
                    httpHeaders.set("Authorization", "Basic " + encoded);
                }
                break;

            case "API_KEY":
                if (req.getAuthApiKeyName() != null && !req.getAuthApiKeyName().isBlank()
                        && req.getAuthApiKeyValue() != null) {
                    httpHeaders.set(req.getAuthApiKeyName(), req.getAuthApiKeyValue());
                }
                break;

            default:
                break;
        }
    }

    /**
     * Execute an ad-hoc (unsaved) request through the backend proxy.
     * Authorization from the UI AuthTab is applied before forwarding.
     */
    public ApiExecutionResponse executeAdHocRequest(AdHocExecuteRequest req) {
        if (req.getUrl() == null || req.getUrl().isBlank()) {
            throw new IllegalArgumentException("URL is required for request execution");
        }

        String methodStr = req.getMethod() != null ? req.getMethod().toUpperCase() : "GET";
        HttpMethod httpMethod;
        try {
            httpMethod = HttpMethod.valueOf(methodStr);
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid HTTP method: " + methodStr);
        }

        HttpHeaders httpHeaders = new HttpHeaders();

        // Apply explicit headers first
        Map<String, String> headers = req.getHeaders();
        if (headers != null && !headers.isEmpty()) {
            for (Map.Entry<String, String> entry : headers.entrySet()) {
                httpHeaders.set(entry.getKey(), entry.getValue());
            }
        }

        // Apply auth — overwrites Authorization header if set
        applyAuth(req, httpHeaders);

        HttpEntity<String> httpEntity = new HttpEntity<>(req.getBody(), httpHeaders);
        long startTime = System.currentTimeMillis();
        ResponseEntity<String> response;

        try {
            response = restTemplate.exchange(
                    req.getUrl(),
                    httpMethod,
                    httpEntity,
                    String.class
            );
        } catch (HttpStatusCodeException ex) {
            long duration = System.currentTimeMillis() - startTime;
            return new ApiExecutionResponse(
                    ex.getStatusCode().value(),
                    ex.getResponseBodyAsString(),
                    duration,
                    extractHeaders(ex.getResponseHeaders())
            );
        } catch (Exception ex) {
            // Network error, DNS failure, timeout, etc.
            long duration = System.currentTimeMillis() - startTime;
            return new ApiExecutionResponse(
                    0,
                    "Request failed: " + ex.getMessage(),
                    duration,
                    new HashMap<>()
            );
        }

        long duration = System.currentTimeMillis() - startTime;
        return new ApiExecutionResponse(
                response.getStatusCode().value(),
                response.getBody(),
                duration,
                extractHeaders(response.getHeaders())
        );
    }
}