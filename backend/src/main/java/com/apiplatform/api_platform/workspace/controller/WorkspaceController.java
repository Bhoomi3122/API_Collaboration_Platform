package com.apiplatform.api_platform.workspace.controller;

import com.apiplatform.api_platform.workspace.dto.CreateWorkspaceRequest;
import com.apiplatform.api_platform.workspace.dto.WorkspaceResponse;
import com.apiplatform.api_platform.workspace.service.WorkspaceService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
public class WorkspaceController {
    private WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceService workspaceService)
    {
        this.workspaceService = workspaceService;
    }

    @PostMapping
    public ResponseEntity<WorkspaceResponse> createWorkspace(@RequestBody CreateWorkspaceRequest request)
    {
        WorkspaceResponse response = workspaceService.createWorkspace(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<WorkspaceResponse>> getUserWorkspaces()
    {
        return ResponseEntity.ok().body(workspaceService.getUserWorkspaces());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkspaceResponse> getWorkspaceById(
            @PathVariable Long id
    )
    {
        return ResponseEntity.ok().body(workspaceService.getWorkspaceById(id));
    }
}
