package com.apiplatform.api_platform.workspace.controller;

import com.apiplatform.api_platform.workspace.dto.request.ChangeRoleRequest;
import com.apiplatform.api_platform.workspace.dto.request.InviteMemberRequest;
import com.apiplatform.api_platform.workspace.dto.response.InvitationResponse;
import com.apiplatform.api_platform.workspace.service.WorkspaceInvitationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class WorkspaceInvitationController {

    private final WorkspaceInvitationService workspaceInvitationService;

    public WorkspaceInvitationController(WorkspaceInvitationService workspaceInvitationService)
    {
        this.workspaceInvitationService = workspaceInvitationService;
    }

    @PostMapping("/api/workspaces/{id}/invite")
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

    @GetMapping("/api/invitations")
    public ResponseEntity<java.util.List<InvitationResponse>> getMyInvitations()
    {
        return ResponseEntity.ok(
                workspaceInvitationService.getMyInvitations()
        );
    }

    @PostMapping("/api/invitations/{id}/accept")
    public ResponseEntity<Void> acceptInvitation(@PathVariable Long id)
    {
        workspaceInvitationService.acceptInvitation(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/api/invitations/{id}/reject")
    public ResponseEntity<Void> rejectInvitation(@PathVariable Long id)
    {
        workspaceInvitationService.rejectInvitation(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/api/workspaces/{workspaceId}/pending-invitations")
    public ResponseEntity<java.util.List<InvitationResponse>> getPendingWorkspaceInvitations(
            @PathVariable Long workspaceId
    )
    {
        return ResponseEntity.ok(
                workspaceInvitationService.getPendingWorkspaceInvitations(workspaceId)
        );
    }

    @GetMapping("/api/workspaces/{workspaceId}/members")
    public ResponseEntity<java.util.List<com.apiplatform.api_platform.workspace.dto.response.MemberResponse>> getWorkspaceMembers(
            @PathVariable Long workspaceId
    )
    {
        return ResponseEntity.ok(
                workspaceInvitationService.getWorkspaceMembers(workspaceId)
        );
    }

    // Delete a pending invitation permanently (owner only)
    @DeleteMapping("/api/invitations/{id}")
    public ResponseEntity<Void> cancelInvitation(@PathVariable Long id)
    {
        workspaceInvitationService.cancelInvitation(id);
        return ResponseEntity.noContent().build();
    }

    // Remove a member from a workspace (owner only)
    @DeleteMapping("/api/workspaces/{workspaceId}/members/{userId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable Long workspaceId,
            @PathVariable Long userId
    )
    {
        workspaceInvitationService.removeMember(workspaceId, userId);
        return ResponseEntity.noContent().build();
    }

    // Change member role (owner only, EDITOR ↔ VIEWER)
    @PutMapping("/api/workspaces/{workspaceId}/members/{userId}/role")
    public ResponseEntity<Void> changeMemberRole(
            @PathVariable Long workspaceId,
            @PathVariable Long userId,
            @Valid @RequestBody ChangeRoleRequest request
    )
    {
        workspaceInvitationService.changeMemberRole(workspaceId, userId, request.getRole());
        return ResponseEntity.ok().build();
    }

}