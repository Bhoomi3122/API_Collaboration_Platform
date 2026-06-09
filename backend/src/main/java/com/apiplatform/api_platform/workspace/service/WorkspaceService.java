package com.apiplatform.api_platform.workspace.service;

import com.apiplatform.api_platform.auth.entity.User;
import com.apiplatform.api_platform.auth.exception.UserNotFoundException;
import com.apiplatform.api_platform.auth.repository.UserRepository;
import com.apiplatform.api_platform.collection.entity.Collection;
import com.apiplatform.api_platform.collection.repository.CollectionRepository;
import com.apiplatform.api_platform.apiRequest.repository.ApiRequestRepository;
import com.apiplatform.api_platform.workspace.dto.request.CreateWorkspaceRequest;
import com.apiplatform.api_platform.workspace.dto.response.WorkspaceResponse;
import com.apiplatform.api_platform.workspace.entity.Workspace;
import com.apiplatform.api_platform.workspace.entity.WorkspaceMember;
import com.apiplatform.api_platform.workspace.exception.WorkspaceNotFoundException;
import com.apiplatform.api_platform.workspace.repository.WorkspaceMemberRepository;
import com.apiplatform.api_platform.workspace.repository.WorkspaceRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class WorkspaceService {
    private WorkspaceRepository workspaceRepository;
    private UserRepository userRepository;
    private CollectionRepository collectionRepository;
    private ApiRequestRepository apiRequestRepository;
    private WorkspaceMemberRepository workspaceMemberRepository;

    public WorkspaceService(WorkspaceRepository workspaceRepository, UserRepository userRepository,
                            CollectionRepository collectionRepository, ApiRequestRepository apiRequestRepository,
                            WorkspaceMemberRepository workspaceMemberRepository)
    {
        this.workspaceRepository = workspaceRepository;
        this.userRepository = userRepository;
        this.collectionRepository = collectionRepository;
        this.apiRequestRepository = apiRequestRepository;
        this.workspaceMemberRepository = workspaceMemberRepository;
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
            WorkspaceResponse response = convertWorkspaceToResponse(workspace);
            response.setRole("OWNER");
            workspaceResponses.add(response);
        }
        return workspaceResponses;
    }

    public List<WorkspaceResponse> getSharedWorkspaces()
    {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        User user = userRepository.findByEmail(email).orElseThrow(()->new UserNotFoundException("User not found"));
        List<WorkspaceResponse> workspaceResponses = new ArrayList<>();
        List<WorkspaceMember> memberships = workspaceMemberRepository.findByUser(user);
        for(WorkspaceMember member:memberships)
        {
            WorkspaceResponse response = convertWorkspaceToResponse(member.getWorkspace());
            // Add role information to the response
            response.setRole(member.getRole().name());
            workspaceResponses.add(response);
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

    public WorkspaceResponse updateWorkspace(Long id, CreateWorkspaceRequest request)
    {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        User user = userRepository.findByEmail(email).orElseThrow(()->new UserNotFoundException("User not found"));
        Workspace workspace = workspaceRepository.findByIdAndOwner(id, user).orElseThrow(()->new WorkspaceNotFoundException("Workspace not found"));
        workspace.setName(request.getName());
        if (request.getDescription() != null) {
            workspace.setDescription(request.getDescription());
        }
        return convertWorkspaceToResponse(workspaceRepository.save(workspace));
    }

    @Transactional
    public void deleteWorkspace(Long id)
    {
        String email = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();
        User user = userRepository.findByEmail(email).orElseThrow(()->new UserNotFoundException("User not found"));
        Workspace workspace = workspaceRepository.findByIdAndOwner(id, user).orElseThrow(()->new WorkspaceNotFoundException("Workspace not found"));

        // Delete all api requests inside collections first
        List<Collection> collections = collectionRepository.findByWorkspace(workspace);
        for (Collection collection : collections) {
            apiRequestRepository.deleteAll(apiRequestRepository.findByCollection(collection));
        }
        // Delete all collections in workspace
        collectionRepository.deleteAll(collections);
        // Now delete the workspace
        workspaceRepository.delete(workspace);
    }
}
