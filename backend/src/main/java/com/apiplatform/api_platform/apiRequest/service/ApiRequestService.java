package com.apiplatform.api_platform.apiRequest.service;

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
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApiRequestService {

    private final ApiRequestRepository apiRequestRepository;
    private final CollectionRepository collectionRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;

    public ApiRequestService(ApiRequestRepository apiRequestRepository,
                             CollectionRepository collectionRepository,
                             UserRepository userRepository,
                             ActivityService activityService) {
        this.apiRequestRepository = apiRequestRepository;
        this.collectionRepository = collectionRepository;
        this.userRepository = userRepository;
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
        return response;
    }

    // ── Create a new API request ────────────────────────────────────────────────

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

        ApiRequest savedRequest = apiRequestRepository.save(apiRequest);
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

        ApiRequest updatedRequest = apiRequestRepository.save(existing);
        return convertToResponse(updatedRequest);
    }

    // ── Delete a request ────────────────────────────────────────────────────────

    public void deleteRequest(Long id) {
        ApiRequest apiRequest = apiRequestRepository.findById(id)
                .orElseThrow(() -> new ApiRequestNotFoundException(
                        "API request not found with id: " + id));

        // Verify ownership before deleting
        User currentUser = getCurrentUser();
        if (!apiRequest.getCollection().getWorkspace()
                .getOwner()
                .getId()
                .equals(currentUser.getId())) {
            throw new ApiRequestNotFoundException(
                    "API request not found with id: " + id);
        }

        apiRequestRepository.delete(apiRequest);
    }
}
