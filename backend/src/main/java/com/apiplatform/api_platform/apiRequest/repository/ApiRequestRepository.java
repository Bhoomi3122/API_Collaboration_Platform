package com.apiplatform.api_platform.apiRequest.repository;

import com.apiplatform.api_platform.collection.entity.Collection;
import com.apiplatform.api_platform.apiRequest.entity.ApiRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApiRequestRepository extends JpaRepository<ApiRequest, Long> {

    List<ApiRequest> findByCollection(Collection collection);

    int countByCollection(Collection collection);
}

