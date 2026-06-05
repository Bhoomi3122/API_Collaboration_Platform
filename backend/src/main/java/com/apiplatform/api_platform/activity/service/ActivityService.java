package com.apiplatform.api_platform.activity.service;

import com.apiplatform.api_platform.activity.entity.Activity;
import com.apiplatform.api_platform.activity.repository.ActivityRepository;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ActivityService {
    private final ActivityRepository activityRepository;

    public ActivityService(ActivityRepository activityRepository)
    {
        this.activityRepository = activityRepository;
    }

//    public List<Activity> getWorkspaceActivities(Long workspaceId){
//
//    }
//
//    public List<Activity> getCollectionActivities(Long collectionId){
//
//    }
}
