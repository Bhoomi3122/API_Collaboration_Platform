package com.apiplatform.api_platform.apiRequest.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ApiRequestResponse {

    private Long id;
    private String name;
    private String method;
    private String url;
    private String description;
    private Map<String, String> headers;
    private String body;
    private Long collectionId;
    private LocalDateTime createdAt;
}

