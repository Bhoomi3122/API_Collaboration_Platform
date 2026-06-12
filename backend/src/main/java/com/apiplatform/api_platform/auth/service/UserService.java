package com.apiplatform.api_platform.auth.service;

import com.apiplatform.api_platform.activity.repository.ActivityRepository;
import com.apiplatform.api_platform.apiRequest.repository.ApiRequestRepository;
import com.apiplatform.api_platform.auth.dto.response.UserProfileResponse;
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
    private final ActivityRepository activityRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                      WorkspaceRepository workspaceRepository,
                      WorkspaceMemberRepository workspaceMemberRepository,
                      CollectionRepository collectionRepository,
                      ApiRequestRepository apiRequestRepository,
                      WorkspaceInvitationRepository workspaceInvitationRepository,
                      ActivityRepository activityRepository,
                      PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.workspaceRepository = workspaceRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
        this.collectionRepository = collectionRepository;
        this.apiRequestRepository = apiRequestRepository;
        this.workspaceInvitationRepository = workspaceInvitationRepository;
        this.activityRepository = activityRepository;
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

    public UserProfileResponse getUserProfile() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        return UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt())
                .build();
    }

    @Transactional
    public void deleteAccount(String password) {
        System.out.println("=== DELETE ACCOUNT START ===");
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));
        System.out.println("User found: " + user.getName());

        if (!passwordEncoder.matches(password, user.getPassword())) {
            System.out.println("Password verification FAILED");
            throw new IllegalArgumentException("Invalid password");
        }
        System.out.println("Password verification SUCCESS");

        // Step 1: Delete ALL activities where this user is the actor
        // (actor_id FK → users table — must be cleared before deleting user)
        activityRepository.deleteAll(activityRepository.findByActor(user));

        // Step 2: Delete ALL invitations where user is the invited person
        workspaceInvitationRepository.deleteAll(
                workspaceInvitationRepository.findByInvitedUser(user)
        );

        // Step 3: Delete ALL invitations where user sent the invite
        workspaceInvitationRepository.deleteAll(
                workspaceInvitationRepository.findByInvitedBy(user)
        );

        // Step 4: Remove user from shared workspaces
        List<WorkspaceMember> memberships = workspaceMemberRepository.findByUser(user);
        workspaceMemberRepository.deleteAll(memberships);

        // Step 5: Delete all owned workspaces and their contents
        List<Workspace> ownedWorkspaces = workspaceRepository.findByOwner(user);
        for (Workspace workspace : ownedWorkspaces) {
            List<Collection> collections = collectionRepository.findByWorkspace(workspace);

            for (Collection collection : collections) {
                // Delete activities for this collection
                activityRepository.deleteAll(activityRepository.findByCollection(collection));
                // Delete all API requests in this collection
                apiRequestRepository.deleteAll(apiRequestRepository.findByCollection(collection));
            }

            // Delete all collections
            collectionRepository.deleteAll(collections);

            // Delete activities for this workspace
            activityRepository.deleteAll(activityRepository.findByWorkspace(workspace));

            // Delete all workspace members
            workspaceMemberRepository.deleteAll(workspaceMemberRepository.findByWorkspace(workspace));

            // Delete ALL workspace invitations (any status)
            workspaceInvitationRepository.deleteAll(
                    workspaceInvitationRepository.findByWorkspace(workspace)
            );

            // Delete the workspace
            workspaceRepository.delete(workspace);
        }

        // Step 6: Finally delete the user
        userRepository.delete(user);
        System.out.println("=== DELETE ACCOUNT SUCCESS ===");
    }
}

