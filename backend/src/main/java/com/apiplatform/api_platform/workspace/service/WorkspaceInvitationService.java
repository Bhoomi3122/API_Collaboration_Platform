package com.apiplatform.api_platform.workspace.service;


import com.apiplatform.api_platform.auth.entity.User;
import com.apiplatform.api_platform.auth.exception.UserNotFoundException;
import com.apiplatform.api_platform.auth.repository.UserRepository;
import com.apiplatform.api_platform.workspace.dto.request.InviteMemberRequest;
import com.apiplatform.api_platform.workspace.dto.response.InvitationResponse;
import com.apiplatform.api_platform.workspace.entity.Workspace;
import com.apiplatform.api_platform.workspace.entity.WorkspaceInvitation;
import com.apiplatform.api_platform.workspace.enums.InvitationStatus;
import com.apiplatform.api_platform.workspace.exception.WorkspaceNotFoundException;
import com.apiplatform.api_platform.workspace.repository.WorkspaceInvitationRepository;
import com.apiplatform.api_platform.workspace.repository.WorkspaceMemberRepository;
import com.apiplatform.api_platform.workspace.repository.WorkspaceRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class WorkspaceInvitationService {
    private WorkspaceRepository workspaceRepository;
    private WorkspaceInvitationRepository workspaceInvitationRepository;
    private WorkspaceMemberRepository workspaceMemberRepository;
    private UserRepository userRepository;
    private WorkspacePermissionService workspacePermissionService;

    public WorkspaceInvitationService(WorkspaceRepository workspaceRepository,
                                      WorkspaceInvitationRepository workspaceInvitationRepository,
                                      WorkspaceMemberRepository workspaceMemberRepository,
                                      UserRepository userRepository,
                                      WorkspacePermissionService workspacePermissionService)
    {
        this.workspaceRepository = workspaceRepository;
        this.workspaceInvitationRepository = workspaceInvitationRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.userRepository = userRepository;
        this.workspacePermissionService = workspacePermissionService;
    }

    private InvitationResponse convertToResponse(
            WorkspaceInvitation invitation
    )
    {
        InvitationResponse response =
                new InvitationResponse();

        response.setId(invitation.getId());

        response.setWorkspaceName(
                invitation.getWorkspace().getName()
        );

        response.setInvitedByName(
                invitation.getInvitedBy().getName()
        );

        response.setInvitedEmail(
                invitation.getInvitedUser().getEmail()
        );

        response.setStatus(
                invitation.getStatus()
        );

        response.setCreatedAt(
                invitation.getCreatedAt()
        );

        response.setExpiresAt(
                invitation.getExpiresAt()
        );

        return response;
    }

    private User getCurrentUser(){
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmail(email)
                .orElseThrow(()->new UserNotFoundException("User not found"));
    }

    public java.util.List<InvitationResponse> getPendingWorkspaceInvitations(Long workspaceId)
    {
        User currentUser = getCurrentUser();
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new WorkspaceNotFoundException("Workspace not found"));

        // Only the owner can see pending invitations they sent
        if (!workspacePermissionService.isOwner(workspace, currentUser)) {
            throw new AccessDeniedException("Only the workspace owner can view pending invitations");
        }

        return workspaceInvitationRepository
                .findByWorkspaceAndStatus(workspace, InvitationStatus.PENDING)
                .stream()
                .map(this::convertToResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    private Workspace getOwnedWorkspace(Long workspaceId)
    {
        User currentUser = getCurrentUser();

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() ->
                        new WorkspaceNotFoundException(
                                "Workspace not found with id: " + workspaceId
                        ));

        if (!workspacePermissionService.canInvite(
                workspace,
                currentUser
        )) {
            throw new AccessDeniedException(
                    "You do not have permission to invite members to this workspace"
            );
        }

        return workspace;
    }
    private User getInvitedUser(String email)
    {
        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new UserNotFoundException(
                                "User not found with email: " + email
                        ));
    }

    private void validateInvitation(
            Workspace workspace,
            User invitedUser
    )
    {
        User currentUser = getCurrentUser();

        if (currentUser.getId().equals(invitedUser.getId())) {
            throw new IllegalArgumentException(
                    "You cannot invite yourself"
            );
        }

        if (workspaceMemberRepository.existsByWorkspaceAndUser(
                workspace,
                invitedUser
        )) {
            throw new IllegalArgumentException(
                    "User is already a member of this workspace"
            );
        }

        if (workspaceInvitationRepository
                .existsByWorkspaceAndInvitedUserAndStatus(
                        workspace,
                        invitedUser,
                        InvitationStatus.PENDING
                )) {

            throw new IllegalArgumentException(
                    "A pending invitation already exists for this user"
            );
        }
    }

    public InvitationResponse inviteMember(
            Long workspaceId,
            InviteMemberRequest request
    )
    {
        Workspace workspace =
                getOwnedWorkspace(workspaceId);

        User invitedUser =
                getInvitedUser(request.getEmail());

        validateInvitation(
                workspace,
                invitedUser
        );

        User currentUser =
                getCurrentUser();

        WorkspaceInvitation invitation =
                new WorkspaceInvitation();

        invitation.setWorkspace(workspace);

        invitation.setInvitedUser(
                invitedUser
        );

        invitation.setInvitedBy(
                currentUser
        );

        invitation.setStatus(
                InvitationStatus.PENDING
        );

        invitation.setToken(
                UUID.randomUUID().toString()
        );

        invitation.setExpiresAt(
                LocalDateTime.now().plusDays(7)
        );

        WorkspaceInvitation savedInvitation =
                workspaceInvitationRepository.save(
                        invitation
                );

        return convertToResponse(
                savedInvitation
        );
    }

    public java.util.List<InvitationResponse> getMyInvitations()
    {
        User currentUser = getCurrentUser();
        java.util.List<WorkspaceInvitation> invitations =
                workspaceInvitationRepository.findByInvitedUser(currentUser);

        return invitations.stream()
                .map(this::convertToResponse)
                .collect(java.util.stream.Collectors.toList());
    }

    public void acceptInvitation(Long invitationId)
    {
        User currentUser = getCurrentUser();
        WorkspaceInvitation invitation = workspaceInvitationRepository
                .findById(invitationId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invitation not found"
                        ));

        if (!invitation.getInvitedUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException(
                    "You cannot accept this invitation"
            );
        }

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Invitation is no longer pending"
            );
        }

        if (invitation.getExpiresAt().isBefore(java.time.LocalDateTime.now())) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            workspaceInvitationRepository.save(invitation);
            throw new IllegalArgumentException(
                    "Invitation has expired"
            );
        }

        // Create workspace member
        com.apiplatform.api_platform.workspace.entity.WorkspaceMember member =
                new com.apiplatform.api_platform.workspace.entity.WorkspaceMember();
        member.setWorkspace(invitation.getWorkspace());
        member.setUser(currentUser);
        member.setRole(com.apiplatform.api_platform.workspace.enums.WorkspaceRole.VIEWER);
        workspaceMemberRepository.save(member);

        // Update invitation status
        invitation.setStatus(InvitationStatus.ACCEPTED);
        workspaceInvitationRepository.save(invitation);
    }

    public void rejectInvitation(Long invitationId)
    {
        User currentUser = getCurrentUser();
        WorkspaceInvitation invitation = workspaceInvitationRepository
                .findById(invitationId)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invitation not found"
                        ));

        if (!invitation.getInvitedUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException(
                    "You cannot reject this invitation"
            );
        }

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Invitation is no longer pending"
            );
        }

        invitation.setStatus(InvitationStatus.REJECTED);
        workspaceInvitationRepository.save(invitation);
    }

    // ── Delete a pending invitation (owner only) ──────────────────────────────
    public void cancelInvitation(Long invitationId)
    {
        User currentUser = getCurrentUser();
        WorkspaceInvitation invitation = workspaceInvitationRepository
                .findById(invitationId)
                .orElseThrow(() -> new IllegalArgumentException("Invitation not found"));

        if (!workspacePermissionService.isOwner(invitation.getWorkspace(), currentUser)) {
            throw new AccessDeniedException("Only the workspace owner can delete invitations");
        }

        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new IllegalArgumentException("Only pending invitations can be deleted");
        }

        workspaceInvitationRepository.delete(invitation);
    }

    // ── Remove a member from a workspace (owner only) ─────────────────────────
    public void removeMember(Long workspaceId, Long userId)
    {
        User currentUser = getCurrentUser();
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new WorkspaceNotFoundException("Workspace not found"));

        if (!workspacePermissionService.isOwner(workspace, currentUser)) {
            throw new AccessDeniedException("Only the workspace owner can remove members");
        }

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new com.apiplatform.api_platform.auth.exception.UserNotFoundException("User not found"));

        if (workspace.getOwner().getId().equals(userId)) {
            throw new IllegalArgumentException("Cannot remove the workspace owner");
        }

        com.apiplatform.api_platform.workspace.entity.WorkspaceMember member =
                workspaceMemberRepository.findByWorkspaceAndUser(workspace, targetUser)
                        .orElseThrow(() -> new IllegalArgumentException("User is not a member of this workspace"));

        workspaceMemberRepository.delete(member);
    }

    // ── Change member role (owner only, EDITOR ↔ VIEWER) ─────────────────────
    public void changeMemberRole(Long workspaceId, Long userId, String newRole)
    {
        User currentUser = getCurrentUser();
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new WorkspaceNotFoundException("Workspace not found"));

        if (!workspacePermissionService.isOwner(workspace, currentUser)) {
            throw new AccessDeniedException("Only the workspace owner can change member roles");
        }

        if (workspace.getOwner().getId().equals(userId)) {
            throw new IllegalArgumentException("Cannot change the owner's role");
        }

        com.apiplatform.api_platform.workspace.enums.WorkspaceRole role;
        try {
            role = com.apiplatform.api_platform.workspace.enums.WorkspaceRole.valueOf(newRole.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("Invalid role. Allowed values: EDITOR, VIEWER");
        }

        if (role == com.apiplatform.api_platform.workspace.enums.WorkspaceRole.OWNER) {
            throw new IllegalArgumentException("Cannot assign OWNER role");
        }

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new com.apiplatform.api_platform.auth.exception.UserNotFoundException("User not found"));

        com.apiplatform.api_platform.workspace.entity.WorkspaceMember member =
                workspaceMemberRepository.findByWorkspaceAndUser(workspace, targetUser)
                        .orElseThrow(() -> new IllegalArgumentException("User is not a member of this workspace"));

        member.setRole(role);
        workspaceMemberRepository.save(member);
    }

    public java.util.List<com.apiplatform.api_platform.workspace.dto.response.MemberResponse> getWorkspaceMembers(
            Long workspaceId
    )
    {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() ->
                        new WorkspaceNotFoundException(
                                "Workspace not found"
                        ));

        java.util.List<com.apiplatform.api_platform.workspace.entity.WorkspaceMember> members =
                workspaceMemberRepository.findByWorkspace(workspace);

        java.util.List<com.apiplatform.api_platform.workspace.dto.response.MemberResponse> responses =
                new java.util.ArrayList<>();

        // Add owner first
        com.apiplatform.api_platform.workspace.dto.response.MemberResponse ownerResponse =
                new com.apiplatform.api_platform.workspace.dto.response.MemberResponse();
        ownerResponse.setId(workspace.getOwner().getId());
        ownerResponse.setName(workspace.getOwner().getName());
        ownerResponse.setEmail(workspace.getOwner().getEmail());
        ownerResponse.setRole(com.apiplatform.api_platform.workspace.enums.WorkspaceRole.OWNER);
        ownerResponse.setJoinedAt(workspace.getCreatedAt());
        responses.add(ownerResponse);

        // Add other members
        for (com.apiplatform.api_platform.workspace.entity.WorkspaceMember member : members) {
            com.apiplatform.api_platform.workspace.dto.response.MemberResponse response =
                    new com.apiplatform.api_platform.workspace.dto.response.MemberResponse();
            response.setId(member.getUser().getId());
            response.setName(member.getUser().getName());
            response.setEmail(member.getUser().getEmail());
            response.setRole(member.getRole());
            response.setJoinedAt(member.getJoinedAt());
            responses.add(response);
        }

        return responses;
    }
}


