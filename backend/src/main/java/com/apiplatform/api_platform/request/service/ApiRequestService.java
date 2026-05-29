package com.apiplatform.api_platform.request.service;

import com.apiplatform.api_platform.collection.entity.Collection;
import com.apiplatform.api_platform.collection.repository.CollectionRepository;
import com.apiplatform.api_platform.exception.ResourceNotFoundException;
import com.apiplatform.api_platform.request.dto.request.CreateApiRequestRequest;
import com.apiplatform.api_platform.request.dto.response.ApiRequestResponse;
import com.apiplatform.api_platform.request.entity.ApiRequest;
import com.apiplatform.api_platform.request.exception.ApiRequestNotFoundException;
import com.apiplatform.api_platform.request.repository.ApiRequestRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ApiRequestService {

    private final ApiRequestRepository apiRequestRepository;
    private final CollectionRepository collectionRepository;

    public ApiRequestService(ApiRequestRepository apiRequestRepository,
                             CollectionRepository collectionRepository) {
        this.apiRequestRepository = apiRequestRepository;
        this.collectionRepository = collectionRepository;
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
        return response;
    }

    // ── Create a new API request ────────────────────────────────────────────────

    public ApiRequestResponse createRequest(CreateApiRequestRequest request) {
        Collection collection = collectionRepository.findById(request.getCollectionId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Collection not found with id: " + request.getCollectionId()));

        ApiRequest apiRequest = new ApiRequest();
        apiRequest.setName(request.getName());
        apiRequest.setMethod(request.getMethod());
        apiRequest.setUrl(request.getUrl());
        apiRequest.setHeaders(request.getHeaders());
        apiRequest.setBody(request.getBody());
        apiRequest.setCollection(collection);

        ApiRequest savedRequest = apiRequestRepository.save(apiRequest);
        return convertToResponse(savedRequest);
    }

    // ── Get all requests for a collection ──────────────────────────────────────

    public List<ApiRequestResponse> getRequestsByCollection(Long collectionId) {
        Collection collection = collectionRepository.findById(collectionId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Collection not found with id: " + collectionId));

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

        return convertToResponse(apiRequest);
    }

    // ── Update an existing request ──────────────────────────────────────────────

    public ApiRequestResponse updateRequest(Long id, CreateApiRequestRequest request) {
        ApiRequest existing = apiRequestRepository.findById(id)
                .orElseThrow(() -> new ApiRequestNotFoundException(
                        "API request not found with id: " + id));

        // Validate new collection if collectionId has changed
        if (!existing.getCollection().getId().equals(request.getCollectionId())) {
            Collection collection = collectionRepository.findById(request.getCollectionId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Collection not found with id: " + request.getCollectionId()));
            existing.setCollection(collection);
        }

        existing.setName(request.getName());
        existing.setMethod(request.getMethod());
        existing.setUrl(request.getUrl());
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

        apiRequestRepository.delete(apiRequest);
    }
}
