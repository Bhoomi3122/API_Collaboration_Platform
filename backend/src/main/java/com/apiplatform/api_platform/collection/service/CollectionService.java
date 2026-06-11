package com.apiplatform.api_platform.collection.service;
import com.apiplatform.api_platform.workspace.repository.WorkspaceMemberRepository;
import com.apiplatform.api_platform.activity.enums.ActivityType;
import com.apiplatform.api_platform.activity.service.ActivityService;
import com.apiplatform.api_platform.auth.entity.User;
import com.apiplatform.api_platform.collection.dto.request.CreateCollectionRequest;
import com.apiplatform.api_platform.collection.dto.response.CollectionResponse;
import com.apiplatform.api_platform.collection.entity.Collection;
import com.apiplatform.api_platform.collection.repository.CollectionRepository;
import com.apiplatform.api_platform.exception.ResourceNotFoundException;
import com.apiplatform.api_platform.auth.repository.UserRepository;
import com.apiplatform.api_platform.workspace.entity.Workspace;
import com.apiplatform.api_platform.workspace.repository.WorkspaceRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CollectionService {

    private final CollectionRepository collectionRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;
    private final com.apiplatform.api_platform.apiRequest.repository.ApiRequestRepository apiRequestRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    public CollectionService(
            CollectionRepository collectionRepository,
            WorkspaceRepository workspaceRepository,
            UserRepository userRepository,
            ActivityService activityService,
            com.apiplatform.api_platform.apiRequest.repository.ApiRequestRepository apiRequestRepository,
            WorkspaceMemberRepository workspaceMemberRepository
    ) {
        this.collectionRepository = collectionRepository;
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
        this.activityService = activityService;
        this.apiRequestRepository = apiRequestRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
    }

    // ─────────────────────────────────────────────────────────────
    // Helper: Get currently authenticated user
    // ─────────────────────────────────────────────────────────────

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));
    }

    // ─────────────────────────────────────────────────────────────
    // Helper: Verify collection ownership
    // ─────────────────────────────────────────────────────────────

    private Collection getOwnedCollection(Long collectionId) {

        Collection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Collection not found with id: " + collectionId
                        ));

        User currentUser = getCurrentUser();

        if (!collection.getWorkspace()
                .getOwner()
                .getId()
                .equals(currentUser.getId())) {

            throw new ResourceNotFoundException(
                    "Collection not found with id: " + collectionId
            );
        }

        return collection;
    }

    // ─────────────────────────────────────────────────────────────
    // Helper: Verify collection access (owner or member)
    // ─────────────────────────────────────────────────────────────

    private Collection getAccessibleCollection(Long collectionId) {

        Collection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Collection not found with id: " + collectionId
                        ));

        User currentUser = getCurrentUser();
        Workspace workspace = collection.getWorkspace();

        // Check if user is owner OR a member
        boolean isOwner = workspace.getOwner().getId().equals(currentUser.getId());
        boolean isMember = workspaceMemberRepository.findByWorkspaceAndUser(workspace, currentUser).isPresent();

        if (!isOwner && !isMember) {
            throw new ResourceNotFoundException(
                    "Collection not found with id: " + collectionId
            );
        }

        return collection;
    }

    // ─────────────────────────────────────────────────────────────
    // Helper: Entity -> DTO
    // ─────────────────────────────────────────────────────────────

    private CollectionResponse convertToResponse(Collection collection) {

        CollectionResponse response = new CollectionResponse();

        response.setId(collection.getId());
        response.setName(collection.getName());
        response.setDescription(collection.getDescription());
        response.setWorkspaceId(collection.getWorkspace().getId());
        response.setCreatedAt(collection.getCreatedAt());
        response.setEndpointCount(apiRequestRepository.countByCollection(collection));

        return response;
    }

    // ─────────────────────────────────────────────────────────────
    // Create Collection
    // ─────────────────────────────────────────────────────────────

    @Transactional
    public CollectionResponse createCollection(
            CreateCollectionRequest request
    ) {

        User currentUser = getCurrentUser();

        // Get workspace and check if user has edit permissions
        Workspace workspace = workspaceRepository
                .findById(request.getWorkspaceId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Workspace not found with id: "
                                        + request.getWorkspaceId()
                        ));

        // Check if user is owner or has EDITOR role
        boolean isOwner = workspace.getOwner().getId().equals(currentUser.getId());
        if (!isOwner) {
            java.util.Optional<com.apiplatform.api_platform.workspace.entity.WorkspaceMember> memberOpt =
                    workspaceMemberRepository.findByWorkspaceAndUser(workspace, currentUser);
            if (!memberOpt.isPresent() ||
                memberOpt.get().getRole() != com.apiplatform.api_platform.workspace.enums.WorkspaceRole.EDITOR) {
                throw new ResourceNotFoundException(
                        "Workspace not found with id: " + request.getWorkspaceId()
                );
            }
        }

        Collection collection = new Collection();

        collection.setName(request.getName());
        collection.setDescription(request.getDescription());
        collection.setWorkspace(workspace);

        Collection savedCollection =
                collectionRepository.save(collection);

        activityService.createActivity(
                ActivityType.COLLECTION_CREATED,
                "Collection '" + savedCollection.getName() + "' created",
                workspace,
                savedCollection,
                currentUser
        );

        return convertToResponse(savedCollection);
    }

    // ─────────────────────────────────────────────────────────────
    // Get All Collections Of Workspace
    // ─────────────────────────────────────────────────────────────

    public List<CollectionResponse> getCollectionsByWorkspace(
            Long workspaceId
    ) {
        User currentUser = getCurrentUser();

        Workspace workspace = workspaceRepository
                .findById(workspaceId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Workspace not found with id: "
                                        + workspaceId
                        ));

        // Check if user is owner OR a member
        boolean isOwner = workspace.getOwner().getId().equals(currentUser.getId());
        boolean isMember = workspaceMemberRepository.findByWorkspaceAndUser(workspace, currentUser).isPresent();

        if (!isOwner && !isMember) {
            throw new ResourceNotFoundException(
                    "Workspace not found with id: " + workspaceId
            );
        }

        return collectionRepository.findByWorkspace(workspace)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────
    // Get Collection By Id
    // ─────────────────────────────────────────────────────────────

    public CollectionResponse getCollectionById(Long id) {

        Collection collection = getAccessibleCollection(id);

        return convertToResponse(collection);
    }

    // ─────────────────────────────────────────────────────────────
    // Update Collection
    // ─────────────────────────────────────────────────────────────

    @Transactional
    public CollectionResponse updateCollection(
            Long id,
            CreateCollectionRequest request
    ) {

        Collection collection = collectionRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Collection not found with id: " + id
                        ));

        User currentUser = getCurrentUser();
        Workspace workspace = collection.getWorkspace();

        // Check if user is owner or has EDITOR role
        boolean isOwner = workspace.getOwner().getId().equals(currentUser.getId());
        if (!isOwner) {
            java.util.Optional<com.apiplatform.api_platform.workspace.entity.WorkspaceMember> memberOpt =
                    workspaceMemberRepository.findByWorkspaceAndUser(workspace, currentUser);
            if (!memberOpt.isPresent() ||
                memberOpt.get().getRole() != com.apiplatform.api_platform.workspace.enums.WorkspaceRole.EDITOR) {
                throw new ResourceNotFoundException(
                        "Collection not found with id: " + id
                );
            }
        }

        collection.setName(request.getName());
        collection.setDescription(request.getDescription());

        Collection updatedCollection =
                collectionRepository.save(collection);

        activityService.createActivity(
                ActivityType.COLLECTION_UPDATED,
                "Collection '" + updatedCollection.getName() + "' updated",
                updatedCollection.getWorkspace(),
                updatedCollection,
                getCurrentUser()
        );

        return convertToResponse(updatedCollection);
    }

    // ─────────────────────────────────────────────────────────────
    // Delete Collection
    // ─────────────────────────────────────────────────────────────

    @Transactional
    public void deleteCollection(Long id) {

        Collection collection = collectionRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Collection not found with id: " + id
                        ));

        User currentUser = getCurrentUser();
        Workspace workspace = collection.getWorkspace();

        // Check if user is owner or has EDITOR role
        boolean isOwner = workspace.getOwner().getId().equals(currentUser.getId());
        if (!isOwner) {
            java.util.Optional<com.apiplatform.api_platform.workspace.entity.WorkspaceMember> memberOpt = 
                    workspaceMemberRepository.findByWorkspaceAndUser(workspace, currentUser);
            if (!memberOpt.isPresent() || 
                memberOpt.get().getRole() != com.apiplatform.api_platform.workspace.enums.WorkspaceRole.EDITOR) {
                throw new ResourceNotFoundException(
                        "Collection not found with id: " + id
                );
            }
        }

        String collectionName = collection.getName();

        collectionRepository.delete(collection);

        activityService.createActivity(
                ActivityType.COLLECTION_DELETED,
                "Collection '" + collectionName + "' deleted",
                workspace,
                null,
                currentUser
        );
    }
}