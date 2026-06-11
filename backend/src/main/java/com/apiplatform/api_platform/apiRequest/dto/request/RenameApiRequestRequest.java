package com.apiplatform.api_platform.apiRequest.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RenameApiRequestRequest {

    @NotBlank(message = "Request name is required")
    private String name;
}

