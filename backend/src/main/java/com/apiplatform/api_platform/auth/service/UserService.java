package com.apiplatform.api_platform.auth.service;

import com.apiplatform.api_platform.apiRequest.entity.ApiRequest;
import com.apiplatform.api_platform.apiRequest.repository.ApiRequestRepository;
import com.apiplatform.api_platform.auth.dto.response.UserStatsResponse;
import com.apiplatform.api_platform.auth.entity.User;
import com.apiplatform.api_platform.auth.exception.UserNotFoundException;
import com.apiplatform.api_platform.auth.repository.UserRepository;
import com.apiplatform.api_platform.collection.entity.Collection;
import com.apiplatform.api_platform.collection.repository.CollectionRepository;
import com.apiplatform.api_platform.workspace.entity.Workspace;
import com.apiplatform.api_platform.workspace.entity.WorkspaceMember;
import com.apiplatform.api_platform.workspace.enums.InvitationStatus;
import com.apiplatform.api_platform.workspace.repository.WorkspaceInvitationRepository;
import com.apiplatform.api_platform.workspace.repository.WorkspaceMemberRepository;
import com.apiplatform.api_platform.workspace.repository.WorkspaceRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final CollectionRepository collectionRepository;
    private final ApiRequestRepository apiRequestRepository;
    private final WorkspaceInvitationRepository workspaceInvitationRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                      WorkspaceRepository workspaceRepository,
                      WorkspaceMemberRepository workspaceMemberRepository,
                      CollectionRepository collectionRepository,
                      ApiRequestRepository apiRequestRepository,
                      WorkspaceInvitationRepository workspaceInvitationRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.collectionRepository = collectionRepository;
        this.apiRequestRepository = apiRequestRepository;
        this.workspaceInvitationRepository = workspaceInvitationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public UserStatsResponse getUserStats() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // Count workspaces owned by user
        List<Workspace> ownedWorkspaces = workspaceRepository.findByOwner(user);
        int workspacesOwned = ownedWorkspaces.size();

        // Count shared workspaces (workspaces where user is a member but not owner)
        List<WorkspaceMember> memberships = workspaceMemberRepository.findByUser(user);
        int sharedWorkspaces = memberships.size();

        // Count total collections (from owned and shared workspaces)
        int totalCollections = 0;
        for (Workspace workspace : ownedWorkspaces) {
            totalCollections += collectionRepository.findByWorkspace(workspace).size();
        }
        for (WorkspaceMember member : memberships) {
            totalCollections += collectionRepository.findByWorkspace(member.getWorkspace()).size();
        }

        // Count total API requests (from all collections)
        int totalRequests = 0;
        for (Workspace workspace : ownedWorkspaces) {
            List<Collection> collections = collectionRepository.findByWorkspace(workspace);
            for (Collection collection : collections) {
                totalRequests += apiRequestRepository.findByCollection(collection).size();
            }
        }
        for (WorkspaceMember member : memberships) {
            List<Collection> collections = collectionRepository.findByWorkspace(member.getWorkspace());
            for (Collection collection : collections) {
                totalRequests += apiRequestRepository.findByCollection(collection).size();
            }
        }

        // Count invitations sent (pending invitations where user is the inviter)
        int invitationsSent = 0;
        for (Workspace workspace : ownedWorkspaces) {
            invitationsSent += workspaceInvitationRepository
                    .findByWorkspaceAndStatus(workspace, InvitationStatus.PENDING)
                    .size();
        }

        // Count invitations received (pending invitations for this user)
        int invitationsReceived = workspaceInvitationRepository
                .findByInvitedUserAndStatus(user, InvitationStatus.PENDING)
                .size();

        return new UserStatsResponse(
                workspacesOwned,
                sharedWorkspaces,
                totalCollections,
                totalRequests,
                invitationsSent,
                invitationsReceived
        );
    }

    @Transactional
    public void deleteAccount(String password) {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        // Verify password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new IllegalArgumentException("Invalid password");
        }

        // Get all owned workspaces
        List<Workspace> ownedWorkspaces = workspaceRepository.findByOwner(user);

        // Delete all owned workspaces and their contents
        for (Workspace workspace : ownedWorkspaces) {
            // Delete all API requests in all collections
            List<Collection> collections = collectionRepository.findByWorkspace(workspace);
            for (Collection collection : collections) {
                apiRequestRepository.deleteAll(apiRequestRepository.findByCollection(collection));
            }

            // Delete all collections
            collectionRepository.deleteAll(collections);

            // Delete workspace members
            workspaceMemberRepository.deleteAll(workspaceMemberRepository.findByWorkspace(workspace));

            // Delete workspace invitations
            workspaceInvitationRepository.deleteAll(
                    workspaceInvitationRepository.findByWorkspaceAndStatus(workspace, InvitationStatus.PENDING)
            );

            // Delete the workspace
            workspaceRepository.delete(workspace);
        }

        // Remove user from shared workspaces
        List<WorkspaceMember> memberships = workspaceMemberRepository.findByUser(user);
        workspaceMemberRepository.deleteAll(memberships);

        // Delete all invitations where user is invited
        workspaceInvitationRepository.deleteAll(workspaceInvitationRepository.findByInvitedUser(user));

        // Finally, delete the user
        userRepository.delete(user);
    }
}

