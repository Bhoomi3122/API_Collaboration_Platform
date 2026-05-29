package com.apiplatform.api_platform.collection.repository;

import com.apiplatform.api_platform.collection.entity.Collection;
import com.apiplatform.api_platform.workspace.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CollectionRepository extends JpaRepository<Collection, Long> {

    List<Collection> findByWorkspace(Workspace workspace);
}

