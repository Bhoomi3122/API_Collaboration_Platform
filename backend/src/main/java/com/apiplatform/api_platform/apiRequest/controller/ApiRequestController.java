package com.apiplatform.api_platform.apiRequest.controller;

import com.apiplatform.api_platform.apiRequest.dto.request.AdHocExecuteRequest;
import com.apiplatform.api_platform.apiRequest.dto.request.CreateApiRequestRequest;
import com.apiplatform.api_platform.apiRequest.dto.response.ApiExecutionResponse;
import com.apiplatform.api_platform.apiRequest.dto.response.ApiRequestResponse;
import com.apiplatform.api_platform.apiRequest.service.ApiRequestService;
import com.apiplatform.api_platform.apiRequest.service.ApiExecutionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ApiRequestController {

    private final ApiRequestService apiRequestService;
    private final ApiExecutionService apiExecutionService;
    public ApiRequestController(ApiRequestService apiRequestService, ApiExecutionService apiExecutionService) {
        this.apiRequestService = apiRequestService;
        this.apiExecutionService = apiExecutionService;
    }

    // ── POST /api/requests ──────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<ApiRequestResponse> createRequest(
            @Valid @RequestBody CreateApiRequestRequest request) {
        ApiRequestResponse response = apiRequestService.createRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ── GET /api/requests/collection/{collectionId} ─────────────────────────────

    @GetMapping("/collection/{collectionId}")
    public ResponseEntity<List<ApiRequestResponse>> getRequestsByCollection(
            @PathVariable Long collectionId) {
        return ResponseEntity.ok(apiRequestService.getRequestsByCollection(collectionId));
    }

    // ── GET /api/requests/{id} ──────────────────────────────────────────────────

    @GetMapping("/{id}")
    public ResponseEntity<ApiRequestResponse> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(apiRequestService.getRequestById(id));
    }

    // ── PUT /api/requests/{id} ──────────────────────────────────────────────────

    @PutMapping("/{id}")
    public ResponseEntity<ApiRequestResponse> updateRequest(
            @PathVariable Long id,
            @Valid @RequestBody CreateApiRequestRequest request) {
        return ResponseEntity.ok(apiRequestService.updateRequest(id, request));
    }

    // ── DELETE /api/requests/{id} ───────────────────────────────────────────────

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRequest(@PathVariable Long id) {
        apiRequestService.deleteRequest(id);
        return ResponseEntity.noContent().build();
    }

    // ── POST /api/requests/execute  (ad-hoc, no save required) ─────────────────
    @PostMapping("/execute")
    public ResponseEntity<ApiExecutionResponse> executeAdHocRequest(
            @RequestBody AdHocExecuteRequest request) {
        return ResponseEntity.ok(apiExecutionService.executeAdHocRequest(request));
    }

    // ── POST /api/requests/{id}/execute  (saved request by ID) ─────────────────
    @PostMapping("/{id}/execute")
    public ResponseEntity<ApiExecutionResponse> executeRequest(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                apiExecutionService.executeRequest(id)
        );
    }
}
