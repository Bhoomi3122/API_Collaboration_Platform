package com.apiplatform.api_platform.workspace.repository;

import com.apiplatform.api_platform.auth.entity.User;
import com.apiplatform.api_platform.workspace.entity.Workspace;
import com.apiplatform.api_platform.workspace.entity.WorkspaceInvitation;
import com.apiplatform.api_platform.workspace.enums.InvitationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkspaceInvitationRepository extends JpaRepository<WorkspaceInvitation, Long> {
    List<WorkspaceInvitation> findByInvitedUser(User invitedUser);

    List<WorkspaceInvitation> findByStatus(InvitationStatus status);

    Optional<WorkspaceInvitation> findByToken(String token);

    boolean existsByWorkspaceAndInvitedUserAndStatus(
            Workspace workspace,
            User invitedUser,
            InvitationStatus status
    );
}