package com.apiplatform.api_platform.activity.service;

import com.apiplatform.api_platform.activity.dto.response.ActivityResponse;
import com.apiplatform.api_platform.activity.entity.Activity;
import com.apiplatform.api_platform.activity.enums.ActivityType;
import com.apiplatform.api_platform.activity.repository.ActivityRepository;
import com.apiplatform.api_platform.auth.entity.User;
import com.apiplatform.api_platform.collection.entity.Collection;
import com.apiplatform.api_platform.workspace.entity.Workspace;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ActivityService {
    private final ActivityRepository activityRepository;

    public ActivityService(ActivityRepository activityRepository)
    {
        this.activityRepository = activityRepository;
    }

    private ActivityResponse convertActivityToResponse(Activity activity) {
        ActivityResponse response = new ActivityResponse();

        response.setId(activity.getId());
        response.setType(activity.getType().name());
        response.setMessage(activity.getMessage());
        response.setActorName(activity.getActor().getName());
        response.setCreatedAt(activity.getCreatedAt());

        return response;
    }

    public List<ActivityResponse> getWorkspaceActivityResponses(Long workspaceId) {
        List<Activity> activities =
                activityRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId);

        List<ActivityResponse> responses = new ArrayList<>();

        for (Activity activity : activities) {
            responses.add(convertActivityToResponse(activity));
        }

        return responses;
    }

    public List<ActivityResponse> getCollectionActivityResponses(Long collectionId) {
        List<Activity> activities =
                activityRepository.findByCollectionIdOrderByCreatedAtDesc(collectionId);

        List<ActivityResponse> responses = new ArrayList<>();

        for (Activity activity : activities) {
            responses.add(convertActivityToResponse(activity));
        }

        return responses;
    }

    public List<Activity> getWorkspaceActivities(Long workspaceId) {
        return activityRepository.findByWorkspaceIdOrderByCreatedAtDesc(workspaceId);
    }

    public List<Activity> getCollectionActivities(Long collectionId) {
        return activityRepository.findByCollectionIdOrderByCreatedAtDesc(collectionId);
    }

    public Activity saveActivity(Activity activity) {
        return activityRepository.save(activity);
    }

    public Activity createActivity(
            ActivityType type,
            String message,
            Workspace workspace,
            Collection collection,
            User actor
    ) {
        Activity activity = new Activity();

        activity.setType(type);
        activity.setMessage(message);
        activity.setWorkspace(workspace);
        activity.setCollection(collection);
        activity.setActor(actor);

        return activityRepository.save(activity);
    }
}
