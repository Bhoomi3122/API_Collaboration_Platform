package com.apiplatform.api_platform.apiRequest.service;

import com.apiplatform.api_platform.activity.enums.ActivityType;
import com.apiplatform.api_platform.activity.service.ActivityService;
import com.apiplatform.api_platform.auth.entity.User;
import com.apiplatform.api_platform.auth.repository.UserRepository;
import com.apiplatform.api_platform.collection.entity.Collection;
import com.apiplatform.api_platform.collection.repository.CollectionRepository;
import com.apiplatform.api_platform.exception.ResourceNotFoundException;
import com.apiplatform.api_platform.apiRequest.dto.request.CreateApiRequestRequest;
import com.apiplatform.api_platform.apiRequest.dto.response.ApiRequestResponse;
import com.apiplatform.api_platform.apiRequest.entity.ApiRequest;
import com.apiplatform.api_platform.apiRequest.exception.ApiRequestNotFoundException;
import com.apiplatform.api_platform.apiRequest.repository.ApiRequestRepository;
import com.apiplatform.api_platform.workspace.entity.Workspace;
import com.apiplatform.api_platform.workspace.entity.WorkspaceMember;
import com.apiplatform.api_platform.workspace.enums.WorkspaceRole;
import com.apiplatform.api_platform.workspace.repository.WorkspaceMemberRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ApiRequestService {

    private final ApiRequestRepository apiRequestRepository;
    private final CollectionRepository collectionRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    public ApiRequestService(ApiRequestRepository apiRequestRepository,
                             CollectionRepository collectionRepository,
                             UserRepository userRepository,
                             ActivityService activityService,
                             WorkspaceMemberRepository workspaceMemberRepository) {
        this.apiRequestRepository = apiRequestRepository;
        this.collectionRepository = collectionRepository;
        this.userRepository = userRepository;
        this.activityService = activityService;
        this.workspaceMemberRepository = workspaceMemberRepository;
    }

    // ── Helper: Get currently authenticated user ──────────────────────────────────────────

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));
    }

    // ── Helper: Check if user can edit workspace (OWNER or EDITOR role) ──────────────────

    private boolean canEditWorkspace(Workspace workspace, User user) {
        // Check if user is the workspace owner
        if (workspace.getOwner().getId().equals(user.getId())) {
            return true;
        }

        // Check if user has OWNER or EDITOR role in workspace members
        Optional<WorkspaceMember> memberOpt = workspaceMemberRepository.findByWorkspaceAndUser(workspace, user);
        if (memberOpt.isPresent()) {
            WorkspaceRole role = memberOpt.get().getRole();
            return role == WorkspaceRole.OWNER || role == WorkspaceRole.EDITOR;
        }

        return false;
    }

    // ── Helper: Verify collection ownership ──────────────────────────────────────────────

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

    // ── Helper: entity → response DTO ──────────────────────────────────────────

    private ApiRequestResponse convertToResponse(ApiRequest apiRequest) {
        ApiRequestResponse response = new ApiRequestResponse();
        response.setId(apiRequest.getId());
        response.setName(apiRequest.getName());
        response.setMethod(apiRequest.getMethod());
        response.setUrl(apiRequest.getUrl());
        response.setHeaders(apiRequest.getHeaders());
        response.setBody(apiRequest.getBody());
        response.setCollectionId(apiRequest.getCollection().getId());
        response.setCreatedAt(apiRequest.getCreatedAt());
        response.setDescription(apiRequest.getDescription());
        // Auth fields — returned so the UI can pre-fill the Authorization tab
        response.setAuthType(apiRequest.getAuthType());
        response.setAuthToken(apiRequest.getAuthToken());
        response.setAuthUsername(apiRequest.getAuthUsername());
        response.setAuthPassword(apiRequest.getAuthPassword());
        response.setAuthApiKeyName(apiRequest.getAuthApiKeyName());
        response.setAuthApiKeyValue(apiRequest.getAuthApiKeyValue());
        return response;
    }

    // ── Create a new API request ────────────────────────────────────────────────

    @Transactional
    public ApiRequestResponse createRequest(CreateApiRequestRequest request) {
        // Verify ownership before creating
        Collection collection = getOwnedCollection(request.getCollectionId());

        ApiRequest apiRequest = new ApiRequest();
        apiRequest.setName(request.getName());
        apiRequest.setMethod(request.getMethod());
        apiRequest.setUrl(request.getUrl());
        apiRequest.setDescription(request.getDescription());
        apiRequest.setHeaders(request.getHeaders());
        apiRequest.setBody(request.getBody());
        apiRequest.setCollection(collection);
        // Persist auth fields so the Auth tab is fully restored on reload
        apiRequest.setAuthType(request.getAuthType());
        apiRequest.setAuthToken(request.getAuthToken());
        apiRequest.setAuthUsername(request.getAuthUsername());
        apiRequest.setAuthPassword(request.getAuthPassword());
        apiRequest.setAuthApiKeyName(request.getAuthApiKeyName());
        apiRequest.setAuthApiKeyValue(request.getAuthApiKeyValue());

        ApiRequest savedRequest = apiRequestRepository.save(apiRequest);
        activityService.createActivity(
                ActivityType.ENDPOINT_CREATED,
                "Endpoint created in \"" + collection.getName() + "\" collection",
                collection.getWorkspace(),
                collection,
                getCurrentUser()
        );
        return convertToResponse(savedRequest);
    }

    // ── Get all requests for a collection ──────────────────────────────────────

    public List<ApiRequestResponse> getRequestsByCollection(Long collectionId) {
        // Verify ownership before fetching
        Collection collection = getOwnedCollection(collectionId);

        List<ApiRequest> requests = apiRequestRepository.findByCollection(collection);

        return requests.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // ── Get a single request by ID ──────────────────────────────────────────────

    public ApiRequestResponse getRequestById(Long id) {
        ApiRequest apiRequest = apiRequestRepository.findById(id)
                .orElseThrow(() -> new ApiRequestNotFoundException(
                        "API request not found with id: " + id));

        // Verify ownership
        User currentUser = getCurrentUser();
        if (!apiRequest.getCollection().getWorkspace()
                .getOwner()
                .getId()
                .equals(currentUser.getId())) {
            throw new ApiRequestNotFoundException(
                    "API request not found with id: " + id);
        }

        return convertToResponse(apiRequest);
    }

    // ── Update an existing request ──────────────────────────────────────────────

    @Transactional
    public ApiRequestResponse updateRequest(Long id, CreateApiRequestRequest request) {
        ApiRequest existing = apiRequestRepository.findById(id)
                .orElseThrow(() -> new ApiRequestNotFoundException(
                        "API request not found with id: " + id));

        // Verify ownership of existing request
        User currentUser = getCurrentUser();
        if (!existing.getCollection().getWorkspace()
                .getOwner()
                .getId()
                .equals(currentUser.getId())) {
            throw new ApiRequestNotFoundException(
                    "API request not found with id: " + id);
        }

        // Validate new collection if collectionId has changed (and verify ownership)
        if (!existing.getCollection().getId().equals(request.getCollectionId())) {
            Collection collection = getOwnedCollection(request.getCollectionId());
            existing.setCollection(collection);
        }

        existing.setName(request.getName());
        existing.setMethod(request.getMethod());
        existing.setUrl(request.getUrl());
        existing.setDescription(request.getDescription());
        existing.setHeaders(request.getHeaders());
        existing.setBody(request.getBody());
        // Update auth fields so the Auth tab stays in sync with saved state
        existing.setAuthType(request.getAuthType());
        existing.setAuthToken(request.getAuthToken());
        existing.setAuthUsername(request.getAuthUsername());
        existing.setAuthPassword(request.getAuthPassword());
        existing.setAuthApiKeyName(request.getAuthApiKeyName());
        existing.setAuthApiKeyValue(request.getAuthApiKeyValue());

        ApiRequest updatedRequest = apiRequestRepository.save(existing);
        activityService.createActivity(
                ActivityType.ENDPOINT_UPDATED,
                "Endpoint '" + updatedRequest.getName() + "' updated in '" + updatedRequest.getCollection().getName() + "' collection",
                updatedRequest.getCollection().getWorkspace(),
                updatedRequest.getCollection(),
                getCurrentUser()
        );
        return convertToResponse(updatedRequest);
    }

    // ── Rename a request ────────────────────────────────────────────────────────

    @Transactional
    public ApiRequestResponse renameRequest(Long id, String newName) {
        ApiRequest apiRequest = apiRequestRepository.findById(id)
                .orElseThrow(() -> new ApiRequestNotFoundException(
                        "API request not found with id: " + id));

        // Verify user has OWNER or EDITOR role in the workspace
        User currentUser = getCurrentUser();
        Workspace workspace = apiRequest.getCollection().getWorkspace();
        
        if (!canEditWorkspace(workspace, currentUser)) {
            throw new ApiRequestNotFoundException(
                    "API request not found with id: " + id);
        }

        String oldName = apiRequest.getName();
        apiRequest.setName(newName);
        ApiRequest updated = apiRequestRepository.save(apiRequest);

        // Create activity only if name actually changed
        if (!oldName.equals(newName)) {
            activityService.createActivity(
                    ActivityType.ENDPOINT_RENAMED,
                    "Endpoint renamed in \"" + updated.getCollection().getName() + "\" collection",
                    updated.getCollection().getWorkspace(),
                    updated.getCollection(),
                    currentUser
            );
        }

        return convertToResponse(updated);
    }

    // ── Delete a request ────────────────────────────────────────────────────────

    @Transactional
    public void deleteRequest(Long id) {
        ApiRequest apiRequest = apiRequestRepository.findById(id)
                .orElseThrow(() -> new ApiRequestNotFoundException(
                        "API request not found with id: " + id));

        // Verify user has OWNER or EDITOR role in the workspace
        User currentUser = getCurrentUser();
        Workspace workspace = apiRequest.getCollection().getWorkspace();

        if (!canEditWorkspace(workspace, currentUser)) {
            throw new ApiRequestNotFoundException(
                    "API request not found with id: " + id);
        }

        String endpointName = apiRequest.getName();
        String collectionName = apiRequest.getCollection().getName();

        apiRequestRepository.delete(apiRequest);

        activityService.createActivity(
                ActivityType.ENDPOINT_DELETED,
                "Endpoint deleted from \"" + collectionName + "\" collection",
                workspace,
                null,
                getCurrentUser()
        );
    }
}
