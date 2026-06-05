package com.apiplatform.api_platform.workspace.dto.request;

import com.apiplatform.api_platform.workspace.enums.WorkspaceRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InviteMemberRequest {
    @NotBlank
    @Email
    private String email;

    @NotNull
    private WorkspaceRole role;
}
