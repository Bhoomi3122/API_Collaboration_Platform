package com.apiplatform.api_platform.workspace.dto.response;

import com.apiplatform.api_platform.workspace.enums.InvitationStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InvitationResponse {
    private Long id;
    private String workspaceName;
    private String invitedByName;
    private InvitationStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime expiresAt;
}
