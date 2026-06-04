package com.apiplatform.api_platform.workspace.dto.response;

import com.apiplatform.api_platform.workspace.enums.WorkspaceRole;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MemberResponse {
    private Long id;
    private String name;
    private String email;
    private WorkspaceRole role;
    private LocalDateTime joinedAt;
}
