package com.apiplatform.api_platform.activity.repository;

import com.apiplatform.api_platform.activity.entity.Activity;
import com.apiplatform.api_platform.auth.entity.User;
import com.apiplatform.api_platform.collection.entity.Collection;
import com.apiplatform.api_platform.workspace.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByWorkspaceIdOrderByCreatedAtDesc(Long workspaceId);

    List<Activity> findByCollectionIdOrderByCreatedAtDesc(Long collectionId);

    // Used for account deletion cleanup
    List<Activity> findByWorkspace(Workspace workspace);

    List<Activity> findByCollection(Collection collection);

    List<Activity> findByActor(User actor);
}
