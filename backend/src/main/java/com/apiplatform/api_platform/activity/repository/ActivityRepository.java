package com.apiplatform.api_platform.activity.repository;

import com.apiplatform.api_platform.activity.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityRepository extends JpaRepository<Activity,Long> {
    List<Activity> findByWorkspaceIdOrderByCreatedAtDesc(Long workspaceId);

    List<Activity> findByCollectionIdOrderByCreatedAtDesc(Long collectionId);
}
