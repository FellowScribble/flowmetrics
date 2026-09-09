package com.flowmetrics.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.flowmetrics.backend.dto.ActivityDTO;
import com.flowmetrics.backend.service.ActivityService;

@RestController
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping("/api/activity")
    public List<ActivityDTO> getActivity(@RequestParam Long companyId) {
        return activityService.findByCompany(companyId);
    }
}