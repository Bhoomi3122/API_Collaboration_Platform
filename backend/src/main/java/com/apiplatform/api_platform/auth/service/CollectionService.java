package com.apiplatform.api_platform.auth.service;

import com.apiplatform.api_platform.auth.dto.request.CreateCollectionRequest;
import com.apiplatform.api_platform.auth.dto.response.CollectionResponse;
import com.apiplatform.api_platform.auth.entity.Collection;
import com.apiplatform.api_platform.auth.entity.Workspace;
import com.apiplatform.api_platform.auth.exception.ResourceNotFoundException;
import com.apiplatform.api_platform.auth.repository.CollectionRepository;
import com.apiplatform.api_platform.auth.repository.WorkspaceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CollectionService {

    private final CollectionRepository collectionRepository;
    private final WorkspaceRepository workspaceRepository;

    public CollectionService(CollectionRepository collectionRepository, WorkspaceRepository workspaceRepository) {
        this.collectionRepository = collectionRepository;
        this.workspaceRepository = workspaceRepository;
    }

    // ── Helper: entity → response DTO ──────────────────────────────────────────

    private CollectionResponse convertToResponse(Collection collection) {
        CollectionResponse response = new CollectionResponse();
        response.setId(collection.getId());
        response.setName(collection.getName());
        response.setDescription(collection.getDescription());
        response.setWorkspaceId(collection.getWorkspace().getId());
        response.setCreatedAt(collection.getCreatedAt());
        return response;
    }

    // ── Create a new collection ─────────────────────────────────────────────────

    public CollectionResponse createCollection(CreateCollectionRequest request) {
        Workspace workspace = workspaceRepository.findById(request.getWorkspaceId())
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found with id: " + request.getWorkspaceId()));

        Collection collection = new Collection();
        collection.setName(request.getName());
        collection.setDescription(request.getDescription());
        collection.setWorkspace(workspace);

        Collection savedCollection = collectionRepository.save(collection);
        return convertToResponse(savedCollection);
    }

    // ── Get all collections for a workspace ────────────────────────────────────

    public List<CollectionResponse> getCollectionsByWorkspace(Long workspaceId) {
        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new ResourceNotFoundException("Workspace not found with id: " + workspaceId));

        List<Collection> collections = collectionRepository.findByWorkspace(workspace);

        return collections.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
}

