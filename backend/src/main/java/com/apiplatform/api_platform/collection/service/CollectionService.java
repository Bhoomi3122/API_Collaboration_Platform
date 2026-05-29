package com.apiplatform.api_platform.collection.service;

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

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CollectionService {

    private final CollectionRepository collectionRepository;
    private final WorkspaceRepository workspaceRepository;
    private final UserRepository userRepository;

    public CollectionService(
            CollectionRepository collectionRepository,
            WorkspaceRepository workspaceRepository,
            UserRepository userRepository
    ) {
        this.collectionRepository = collectionRepository;
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
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
    // Helper: Entity -> DTO
    // ─────────────────────────────────────────────────────────────

    private CollectionResponse convertToResponse(Collection collection) {

        CollectionResponse response = new CollectionResponse();

        response.setId(collection.getId());
        response.setName(collection.getName());
        response.setDescription(collection.getDescription());
        response.setWorkspaceId(collection.getWorkspace().getId());
        response.setCreatedAt(collection.getCreatedAt());

        return response;
    }

    // ─────────────────────────────────────────────────────────────
    // Create Collection
    // ─────────────────────────────────────────────────────────────

    public CollectionResponse createCollection(
            CreateCollectionRequest request
    ) {

        User currentUser = getCurrentUser();

        Workspace workspace = workspaceRepository
                .findByIdAndOwner(
                        request.getWorkspaceId(),
                        currentUser
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Workspace not found with id: "
                                        + request.getWorkspaceId()
                        ));

        Collection collection = new Collection();

        collection.setName(request.getName());
        collection.setDescription(request.getDescription());
        collection.setWorkspace(workspace);

        Collection savedCollection =
                collectionRepository.save(collection);

        return convertToResponse(savedCollection);
    }

    // ─────────────────────────────────────────────────────────────
    // Get All Collections Of Workspace
    // ─────────────────────────────────────────────────────────────

    public List<CollectionResponse> getCollectionsByWorkspace(
            Long workspaceId
    ) {
        System.out.println("Reached getCollectionsByWorkspace");
        User currentUser = getCurrentUser();

        Workspace workspace = workspaceRepository
                .findByIdAndOwner(
                        workspaceId,
                        currentUser
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Workspace not found with id: "
                                        + workspaceId
                        ));

        return collectionRepository.findByWorkspace(workspace)
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ─────────────────────────────────────────────────────────────
    // Get Collection By Id
    // ─────────────────────────────────────────────────────────────

    public CollectionResponse getCollectionById(Long id) {

        Collection collection = getOwnedCollection(id);

        return convertToResponse(collection);
    }

    // ─────────────────────────────────────────────────────────────
    // Update Collection
    // ─────────────────────────────────────────────────────────────

    public CollectionResponse updateCollection(
            Long id,
            CreateCollectionRequest request
    ) {

        Collection collection = getOwnedCollection(id);

        collection.setName(request.getName());
        collection.setDescription(request.getDescription());

        Collection updatedCollection =
                collectionRepository.save(collection);

        return convertToResponse(updatedCollection);
    }

    // ─────────────────────────────────────────────────────────────
    // Delete Collection
    // ─────────────────────────────────────────────────────────────

    public void deleteCollection(Long id) {

        Collection collection = getOwnedCollection(id);

        collectionRepository.delete(collection);
    }
}