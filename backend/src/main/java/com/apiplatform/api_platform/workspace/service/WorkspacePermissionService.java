package com.apiplatform.api_platform.workspace.service;

import com.apiplatform.api_platform.auth.entity.User;
import com.apiplatform.api_platform.workspace.entity.Workspace;
import com.apiplatform.api_platform.workspace.entity.WorkspaceMember;
import com.apiplatform.api_platform.workspace.enums.WorkspaceRole;
import com.apiplatform.api_platform.workspace.repository.WorkspaceMemberRepository;
import org.springframework.stereotype.Service;

@Service
public class WorkspacePermissionService {
    private final WorkspaceMemberRepository workspaceMemberRepository;

    public WorkspacePermissionService(WorkspaceMemberRepository workspaceMemberRepository)
    {
        this.workspaceMemberRepository = workspaceMemberRepository;
    }
    private WorkspaceMember getMembership(Workspace workspace, User user)
    {
        return workspaceMemberRepository
                .findByWorkspaceAndUser(workspace, user)
                .orElse(null);
    }
    public boolean isOwner(Workspace workspace, User user)
    {
        return workspace.getOwner()
                .getId()
                .equals(user.getId());
    }
    public boolean isEditor(Workspace workspace, User user)
    {
        WorkspaceMember member = getMembership(workspace, user);
        return member != null &&
                member.getRole() == WorkspaceRole.EDITOR;
    }
    public boolean isViewer(Workspace workspace, User user)
    {
        WorkspaceMember member = getMembership(workspace, user);

        return member != null &&
                member.getRole() == WorkspaceRole.VIEWER;
    }
    public boolean canInvite(Workspace workspace, User user)
    {
        return isOwner(workspace, user);
    }
    public boolean canEdit(Workspace workspace, User user)
    {
        return (isOwner(workspace,user)||isEditor(workspace,user));
    }
    public boolean canDelete(Workspace workspace, User user)
    {
        return isOwner(workspace,user);
    }

}
