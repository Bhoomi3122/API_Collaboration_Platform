package com.apiplatform.api_platform.workspace.repository;

import com.apiplatform.api_platform.auth.entity.User;
import com.apiplatform.api_platform.workspace.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface WorkspaceRepository extends JpaRepository<Workspace,Long> {
    List<Workspace> findByOwner(User owner);

    Optional<Workspace> findByIdAndOwner(Long id, User owner);
}
