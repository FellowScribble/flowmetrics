package com.flowmetrics.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.flowmetrics.backend.dto.ActivityDTO;
import com.flowmetrics.backend.service.ActivityService;
import com.flowmetrics.backend.context.SessionGuard;

@RestController
public class ActivityController {

    private final ActivityService activityService;
    private final SessionGuard sessionGuard;

    public ActivityController(ActivityService activityService, SessionGuard sessionGuard) {
        this.activityService = activityService;
        this.sessionGuard = sessionGuard;
    }

    @GetMapping("/api/activity")
    public List<ActivityDTO> getActivity() {
        return activityService.findByCompany(sessionGuard.requireCompanyId());
    }
}
