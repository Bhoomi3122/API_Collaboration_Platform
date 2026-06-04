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

    private Workspace getOwnedWorkspace(Long workspaceId)
    {
        User currentUser = getCurrentUser();

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() ->
                        new WorkspaceNotFoundException(
                                "Workspace not found with id: " + workspaceId
                        ));
        System.out.println("Current User ID = " + currentUser.getId());
        System.out.println("Current User Email = " + currentUser.getEmail());

        System.out.println("Workspace Owner ID = " + workspace.getOwner().getId());
        System.out.println("Workspace Owner Email = " + workspace.getOwner().getEmail());

        System.out.println(
                "isOwner = " +
                        workspacePermissionService.isOwner(
                                workspace,
                                currentUser
                        )
        );
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
}

