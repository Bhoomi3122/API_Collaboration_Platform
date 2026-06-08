package com.apiplatform.api_platform.apiRequest.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreateApiRequestRequest {

    @NotBlank(message = "Request name is required")
    private String name;

    @NotBlank(message = "HTTP method is required")
    private String method;

    @NotBlank(message = "URL is required")
    private String url;

    private String description;

    private Map<String, String> headers;

    private String body;

    @NotNull(message = "Collection ID is required")
    private Long collectionId;

    // ── Authorization fields (optional) ─────────────────────────────────────
    private String authType;
    private String authToken;
    private String authUsername;
    private String authPassword;
    private String authApiKeyName;
    private String authApiKeyValue;
}

