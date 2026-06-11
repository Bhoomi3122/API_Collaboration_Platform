package com.apiplatform.api_platform.collection.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CollectionResponse {

    private Long id;
    private String name;
    private String description;
    private Long workspaceId;
    private LocalDateTime createdAt;
    private Integer endpointCount;
}

