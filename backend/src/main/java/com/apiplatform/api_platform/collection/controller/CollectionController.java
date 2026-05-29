package com.apiplatform.api_platform.collection.controller;

import com.apiplatform.api_platform.collection.dto.request.CreateCollectionRequest;
import com.apiplatform.api_platform.collection.dto.response.CollectionResponse;
import com.apiplatform.api_platform.collection.service.CollectionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
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

    // Create Collection

    @PostMapping
    public ResponseEntity<CollectionResponse> createCollection(
            @Valid @RequestBody CreateCollectionRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(collectionService.createCollection(request));
    }

    // Get All Collections Of A Workspace

    @GetMapping("/workspace/{workspaceId}")
    public ResponseEntity<List<CollectionResponse>> getCollectionsByWorkspace(
            @PathVariable Long workspaceId
    ) {
        return ResponseEntity.ok(
                collectionService.getCollectionsByWorkspace(workspaceId)
        );
    }

    // Get Collection By Id

    @GetMapping("/{id}")
    public ResponseEntity<CollectionResponse> getCollectionById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                collectionService.getCollectionById(id)
        );
    }

    // Update Collection

    @PutMapping("/{id}")
    public ResponseEntity<CollectionResponse> updateCollection(
            @PathVariable Long id,
            @Valid @RequestBody CreateCollectionRequest request
    ) {
        return ResponseEntity.ok(
                collectionService.updateCollection(id, request)
        );
    }

    // Delete Collection

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCollection(
            @PathVariable Long id
    ) {
        collectionService.deleteCollection(id);

        return ResponseEntity.noContent().build();
    }
}