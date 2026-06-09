package com.apiplatform.api_platform.apiRequest.dto.request;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

/**
 * DTO for ad-hoc (unsaved) API request execution.
 * Contains all fields needed to forward the request to the target API,
 * including optional authorization configuration.
 */
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AdHocExecuteRequest {

    private String method;
    private String url;
    private Map<String, String> headers;
    private String body;

    // Authorization type: NONE | BEARER_TOKEN | BASIC_AUTH | API_KEY
    private String authType;

    // Bearer Token
    private String authToken;

    // Basic Auth
    private String authUsername;
    private String authPassword;

    // API Key (injected as a request header)
    private String authApiKeyName;
    private String authApiKeyValue;
}

