package com.apiplatform.api_platform.workspace.repository;

import com.apiplatform.api_platform.auth.entity.User;
import com.apiplatform.api_platform.workspace.entity.Workspace;
import com.apiplatform.api_platform.workspace.entity.WorkspaceMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkspaceMemberRepository
        extends JpaRepository<WorkspaceMember, Long> {
    List<WorkspaceMember> findByWorkspace(Workspace workspace);

    List<WorkspaceMember> findByUser(User user);

    Optional<WorkspaceMember> findByWorkspaceAndUser(
            Workspace workspace,
            User user
    );

    boolean existsByWorkspaceAndUser(
            Workspace workspace,
            User user
    );
}