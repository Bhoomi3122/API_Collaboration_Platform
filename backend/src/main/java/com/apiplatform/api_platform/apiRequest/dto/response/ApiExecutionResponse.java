package com.apiplatform.api_platform.apiRequest.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ApiExecutionResponse {

    private int statusCode;
    private String responseBody;
    private long responseTime;
    private Map<String, String> responseHeaders;

}