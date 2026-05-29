package com.apiplatform.api_platform.request.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    private String headers;

    private String body;

    @NotNull(message = "Collection ID is required")
    private Long collectionId;
}

