package com.apiplatform.api_platform.auth.controller;

import com.apiplatform.api_platform.auth.dto.request.CreateCollectionRequest;
import com.apiplatform.api_platform.auth.dto.response.CollectionResponse;
import com.apiplatform.api_platform.auth.service.CollectionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/collections")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class CollectionController {

    private final CollectionService collectionService;

    public CollectionController(CollectionService collectionService) {
        this.collectionService = collectionService;
    }

    @PostMapping
    public ResponseEntity<CollectionResponse> createCollection(@Valid @RequestBody CreateCollectionRequest request) {
        return ResponseEntity.ok(collectionService.createCollection(request));
    }

    @GetMapping("/workspace/{workspaceId}")
    public ResponseEntity<List<CollectionResponse>> getCollectionsByWorkspace(@PathVariable Long workspaceId) {
        return ResponseEntity.ok(collectionService.getCollectionsByWorkspace(workspaceId));
    }
}

