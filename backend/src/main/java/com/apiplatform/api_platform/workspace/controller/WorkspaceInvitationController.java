package com.apiplatform.api_platform.workspace.controller;

import com.apiplatform.api_platform.workspace.dto.request.InviteMemberRequest;
import com.apiplatform.api_platform.workspace.dto.response.InvitationResponse;
import com.apiplatform.api_platform.workspace.service.WorkspaceInvitationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class WorkspaceInvitationController {

    private final WorkspaceInvitationService workspaceInvitationService;

    public WorkspaceInvitationController(WorkspaceInvitationService workspaceInvitationService) {
        this.workspaceInvitationService = workspaceInvitationService;
    }

    // POST /api/workspaces/{id}/invite
    @PostMapping("/api/workspaces/{id}/invite")
    public ResponseEntity<InvitationResponse> inviteMember(
            @PathVariable Long id,
            @Valid @RequestBody InviteMemberRequest request
    ) {
        return ResponseEntity.ok(workspaceInvitationService.inviteMember(id, request));
    }

    // GET /api/invitations/pending  — logged-in user sees their pending invites
    @GetMapping("/api/invitations/pending")
    public ResponseEntity<List<InvitationResponse>> getPendingInvitations() {
        return ResponseEntity.ok(workspaceInvitationService.getPendingInvitations());
    }

    // POST /api/invitations/{id}/accept  — accept a pending invitation
    @PostMapping("/api/invitations/{id}/accept")
    public ResponseEntity<InvitationResponse> acceptInvitation(@PathVariable Long id) {
        return ResponseEntity.ok(workspaceInvitationService.acceptInvitation(id));
    }

    // POST /api/invitations/{id}/reject  — reject a pending invitation by ID
    @PostMapping("/api/invitations/{id}/reject")
    public ResponseEntity<InvitationResponse> rejectInvitation(@PathVariable Long id) {
        return ResponseEntity.ok(workspaceInvitationService.rejectInvitation(id));
    }

    // POST /api/invitations/{token}/reject  — reject a pending invitation by token (Step 10)
    @PostMapping("/api/invitations/token/{token}/reject")
    public ResponseEntity<InvitationResponse> rejectInvitationByToken(@PathVariable String token) {
        return ResponseEntity.ok(workspaceInvitationService.rejectInvitationByToken(token));
    }
}