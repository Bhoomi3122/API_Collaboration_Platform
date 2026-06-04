package com.apiplatform.api_platform.workspace.controller;

import com.apiplatform.api_platform.workspace.dto.request.InviteMemberRequest;
import com.apiplatform.api_platform.workspace.dto.response.InvitationResponse;
import com.apiplatform.api_platform.workspace.service.WorkspaceInvitationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceInvitationController {

    private final WorkspaceInvitationService workspaceInvitationService;

    public WorkspaceInvitationController(WorkspaceInvitationService workspaceInvitationService)
    {
        this.workspaceInvitationService = workspaceInvitationService;
    }

    @PostMapping("/{id}/invite")
    public ResponseEntity<InvitationResponse> inviteMember(
            @PathVariable Long id,
            @Valid @RequestBody InviteMemberRequest request
    )
    {
        return ResponseEntity.ok(
                workspaceInvitationService.inviteMember(
                        id,
                        request
                )
        );
    }

}