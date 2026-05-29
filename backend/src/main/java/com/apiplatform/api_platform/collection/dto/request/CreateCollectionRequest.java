package com.apiplatform.api_platform.collection.dto.request;

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
public class CreateCollectionRequest {

    @NotBlank(message = "Collection name is required")
    private String name;

    private String description;

    @NotNull(message = "Workspace ID is required")
    private Long workspaceId;
}

