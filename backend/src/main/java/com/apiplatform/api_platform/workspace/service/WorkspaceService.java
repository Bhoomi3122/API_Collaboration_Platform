package com.apiplatform.api_platform.workspace.service;

import com.apiplatform.api_platform.auth.entity.User;
import com.apiplatform.api_platform.auth.exception.UserNotFoundException;
import com.apiplatform.api_platform.auth.repository.UserRepository;
import com.apiplatform.api_platform.workspace.dto.CreateWorkspaceRequest;
import com.apiplatform.api_platform.workspace.dto.WorkspaceResponse;
import com.apiplatform.api_platform.workspace.entity.Workspace;
import com.apiplatform.api_platform.workspace.exception.WorkspaceNotFoundException;
import com.apiplatform.api_platform.workspace.repository.WorkspaceRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class WorkspaceService {
    private WorkspaceRepository workspaceRepository;

    private UserRepository userRepository;

    public WorkspaceService(WorkspaceRepository workspaceRepository, UserRepository userRepository)
    {
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
    }

    private WorkspaceResponse convertWorkspaceToResponse(Workspace workspace)
    {
        WorkspaceResponse workspaceResponse = new WorkspaceResponse();
        workspaceResponse.setId(workspace.getId());
        workspaceResponse.setName(workspace.getName());
        workspaceResponse.setDescription(workspace.getDescription());
        workspaceResponse.setCreatedAt(workspace.getCreatedAt());
        return workspaceResponse;
    }

    public WorkspaceResponse createWorkspace(CreateWorkspaceRequest request)
    {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        User user = userRepository.findByEmail(email).orElseThrow(()->new UserNotFoundException("User not found"));
        Workspace workspace = new Workspace();
        workspace.setName(request.getName());
        workspace.setDescription(request.getDescription());
        workspace.setOwner(user);
        Workspace savedWorkspace = workspaceRepository.save(workspace);
        return convertWorkspaceToResponse(savedWorkspace);
    }

    public List<WorkspaceResponse> getUserWorkspaces()
    {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        User user = userRepository.findByEmail(email).orElseThrow(()->new UserNotFoundException("User not found"));
        List<WorkspaceResponse> workspaceResponses = new ArrayList<>();
        List<Workspace> workspaces = workspaceRepository.findByOwner(user);
        for(Workspace workspace:workspaces)
        {
            workspaceResponses.add(convertWorkspaceToResponse(workspace));
        }
        return workspaceResponses;
    }

    public WorkspaceResponse getWorkspaceById(Long id)
    {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        User user = userRepository.findByEmail(email).orElseThrow(()->new RuntimeException("User not found"));
        Workspace workspace = workspaceRepository.findByIdAndOwner(id,user).orElseThrow(()->new WorkspaceNotFoundException("Workspace not found"));
        return convertWorkspaceToResponse(workspace);
    }
}
