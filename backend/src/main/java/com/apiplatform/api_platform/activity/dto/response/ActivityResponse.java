package com.apiplatform.api_platform.activity.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ActivityResponse {
    private Long id;

    private String type;

    private String message;

    private String actorName;

    private LocalDateTime createdAt;
}
