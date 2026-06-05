package com.apiplatform.api_platform.workspace.service;


import com.apiplatform.api_platform.auth.entity.User;
import com.apiplatform.api_platform.auth.exception.UserNotFoundException;
import com.apiplatform.api_platform.auth.repository.UserRepository;
import com.apiplatform.api_platform.workspace.dto.request.InviteMemberRequest;
import com.apiplatform.api_platform.workspace.dto.response.InvitationResponse;
import com.apiplatform.api_platform.workspace.entity.Workspace;
import com.apiplatform.api_platform.workspace.entity.WorkspaceInvitation;
import com.apiplatform.api_platform.workspace.entity.WorkspaceMember;
import com.apiplatform.api_platform.workspace.enums.InvitationStatus;
import com.apiplatform.api_platform.workspace.enums.WorkspaceRole;
import com.apiplatform.api_platform.workspace.exception.WorkspaceNotFoundException;
import com.apiplatform.api_platform.workspace.repository.WorkspaceInvitationRepository;
import com.apiplatform.api_platform.workspace.repository.WorkspaceMemberRepository;
import com.apiplatform.api_platform.workspace.repository.WorkspaceRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class WorkspaceInvitationService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceInvitationRepository workspaceInvitationRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    private final WorkspacePermissionService workspacePermissionService;
    private final EmailService emailService;

    public WorkspaceInvitationService(
            WorkspaceRepository workspaceRepository,
            WorkspaceInvitationRepository workspaceInvitationRepository,
            WorkspaceMemberRepository workspaceMemberRepository,
            UserRepository userRepository,
            WorkspacePermissionService workspacePermissionService,
            EmailService emailService)
    {
        this.workspaceRepository = workspaceRepository;
        this.workspaceInvitationRepository = workspaceInvitationRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.userRepository = userRepository;
        this.workspacePermissionService = workspacePermissionService;
        this.emailService = emailService;
    }

    // ── Convert entity → response DTO ─────────────────────────────
    private InvitationResponse convertToResponse(WorkspaceInvitation invitation) {
        InvitationResponse response = new InvitationResponse();

        response.setId(invitation.getId());
        response.setWorkspaceId(invitation.getWorkspace().getId());
        response.setWorkspaceName(invitation.getWorkspace().getName());
        response.setInvitedByName(invitation.getInvitedBy().getName());
        response.setInvitedUserEmail(invitation.getInvitedUser().getEmail());
        response.setRole(invitation.getRole());
        response.setStatus(invitation.getStatus());
        response.setCreatedAt(invitation.getCreatedAt());
        response.setExpiresAt(invitation.getExpiresAt());

        return response;
    }

    // ── Get currently logged-in user from JWT ─────────────────────
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
    }

    // ── Verify current user has invite permission ─────────────────
    private Workspace getOwnedWorkspace(Long workspaceId) {
        User currentUser = getCurrentUser();

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new WorkspaceNotFoundException(
                        "Workspace not found with id: " + workspaceId));

        if (!workspacePermissionService.canInvite(workspace, currentUser)) {
            throw new AccessDeniedException(
                    "You do not have permission to invite members to this workspace");
        }

        return workspace;
    }

    // ── Find invited user by email ────────────────────────────────
    private User getInvitedUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException(
                        "User not found with email: " + email));
    }

    // ── Business rule validations ─────────────────────────────────
    private void validateInvitation(Workspace workspace, User invitedUser) {
        User currentUser = getCurrentUser();

        if (currentUser.getId().equals(invitedUser.getId())) {
            throw new IllegalArgumentException("You cannot invite yourself");
        }

        if (workspaceMemberRepository.existsByWorkspaceAndUser(workspace, invitedUser)) {
            throw new IllegalArgumentException(
                    "User is already a member of this workspace");
        }

        if (workspaceInvitationRepository.existsByWorkspaceAndInvitedUserAndStatus(
                workspace, invitedUser, InvitationStatus.PENDING)) {
            throw new IllegalArgumentException(
                    "A pending invitation already exists for this user");
        }
    }

    // ── Guard: OWNER role cannot be assigned via invite ───────────
    private void validateRole(WorkspaceRole role) {
        if (role == WorkspaceRole.OWNER) {
            throw new IllegalArgumentException(
                    "Cannot assign OWNER role via invitation. Only EDITOR or VIEWER is allowed.");
        }
    }

    // ── Main: Send invitation ─────────────────────────────────────
    public InvitationResponse inviteMember(Long workspaceId, InviteMemberRequest request) {

        // 1. Check workspace exists + current user has permission
        Workspace workspace = getOwnedWorkspace(workspaceId);

        // 2. Check invited user exists
        User invitedUser = getInvitedUser(request.getEmail());

        // 3. Validate business rules (not self, not already member, no duplicate pending)
        validateInvitation(workspace, invitedUser);

        // 4. Guard: role must be EDITOR or VIEWER, not OWNER
        validateRole(request.getRole());

        User currentUser = getCurrentUser();

        // 5. Build invitation record
        WorkspaceInvitation invitation = new WorkspaceInvitation();
        invitation.setWorkspace(workspace);
        invitation.setInvitedUser(invitedUser);
        invitation.setInvitedBy(currentUser);
        invitation.setRole(request.getRole());
        invitation.setStatus(InvitationStatus.PENDING);
        invitation.setToken(UUID.randomUUID().toString());
        invitation.setExpiresAt(LocalDateTime.now().plusDays(7));

        // 6. Save to DB
        WorkspaceInvitation savedInvitation = workspaceInvitationRepository.save(invitation);

        // 7. Send invitation email
        emailService.sendInvitationEmail(
                invitedUser.getEmail(),
                workspace.getName(),
                currentUser.getName(),
                savedInvitation.getToken(),
                request.getRole().name()
        );

        // 8. Return response
        return convertToResponse(savedInvitation);
    }

    // ── Get all PENDING invitations for the logged-in user ────────────
    public List<InvitationResponse> getPendingInvitations() {
        User currentUser = getCurrentUser();

        return workspaceInvitationRepository
                .findByInvitedUserAndStatus(currentUser, InvitationStatus.PENDING)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ── Accept invitation ──────────────────────────────────────────────
    public InvitationResponse acceptInvitation(Long invitationId) {
        User currentUser = getCurrentUser();

        WorkspaceInvitation invitation = workspaceInvitationRepository
                .findById(invitationId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invitation not found with id: " + invitationId));

        // Only the invited user can accept
        if (!invitation.getInvitedUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not allowed to accept this invitation");
        }

        // Must be PENDING
        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Invitation is no longer pending. Current status: " + invitation.getStatus());
        }

        // Check expiry
        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            invitation.setStatus(InvitationStatus.EXPIRED);
            workspaceInvitationRepository.save(invitation);
            throw new IllegalArgumentException("Invitation has expired");
        }

        // Mark invitation as ACCEPTED
        invitation.setStatus(InvitationStatus.ACCEPTED);
        workspaceInvitationRepository.save(invitation);

        // Add user as workspace member
        WorkspaceMember member = new WorkspaceMember();
        member.setWorkspace(invitation.getWorkspace());
        member.setUser(currentUser);
        member.setRole(invitation.getRole());
        workspaceMemberRepository.save(member);

        return convertToResponse(invitation);
    }

    // ── Reject invitation by ID ────────────────────────────────────────
    public InvitationResponse rejectInvitation(Long invitationId) {
        User currentUser = getCurrentUser();

        WorkspaceInvitation invitation = workspaceInvitationRepository
                .findById(invitationId)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invitation not found with id: " + invitationId));

        // Only the invited user can reject
        if (!invitation.getInvitedUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException("You are not allowed to reject this invitation");
        }

        // Must be PENDING
        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Invitation is no longer pending. Current status: " + invitation.getStatus());
        }

        // Mark invitation as REJECTED
        invitation.setStatus(InvitationStatus.REJECTED);
        workspaceInvitationRepository.save(invitation);

        return convertToResponse(invitation);
    }

    // ── Reject invitation by TOKEN (Step 10) ──────────────────────────
    public InvitationResponse rejectInvitationByToken(String token) {
        User currentUser = getCurrentUser();

        // 1. Find invitation by token
        WorkspaceInvitation invitation = workspaceInvitationRepository
                .findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException(
                        "Invalid or unknown invitation token"));

        // 2. Check current user matches the invited user
        if (!invitation.getInvitedUser().getId().equals(currentUser.getId())) {
            throw new AccessDeniedException(
                    "You are not allowed to reject this invitation");
        }

        // 3. Check status is PENDING
        if (invitation.getStatus() != InvitationStatus.PENDING) {
            throw new IllegalArgumentException(
                    "Invitation is no longer pending. Current status: " + invitation.getStatus());
        }

        // 4. Update status to REJECTED
        invitation.setStatus(InvitationStatus.REJECTED);
        workspaceInvitationRepository.save(invitation);

        // 5. Return updated response
        return convertToResponse(invitation);
    }
}
