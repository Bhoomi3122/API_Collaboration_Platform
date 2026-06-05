package com.apiplatform.api_platform.activity.controller;

import com.apiplatform.api_platform.activity.dto.response.ActivityResponse;
import com.apiplatform.api_platform.activity.service.ActivityService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class ActivityController{
    private ActivityService activityService;

    public ActivityController(ActivityService activityService)
    {
        this.activityService = activityService;
    }

    @GetMapping("/workspace/{workspaceId}")
    public ResponseEntity<List<ActivityResponse>> getWorkspaceActivities(
            @PathVariable Long workspaceId
    ) {
        return ResponseEntity.ok(
                activityService.getWorkspaceActivityResponses(workspaceId)
        );
    }

    @GetMapping("/collection/{collectionId}")
    public ResponseEntity<List<ActivityResponse>> getCollectionActivities(
            @PathVariable Long collectionId
    ) {
        return ResponseEntity.ok(
                activityService.getCollectionActivityResponses(collectionId)
        );
    }
}