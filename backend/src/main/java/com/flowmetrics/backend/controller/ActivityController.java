package com.flowmetrics.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.flowmetrics.backend.dto.ActivityDTO;
import com.flowmetrics.backend.service.ActivityService;
import com.flowmetrics.backend.context.DemoContext;

@RestController
public class ActivityController {

    private final ActivityService activityService;
    private final DemoContext demoContext;

    public ActivityController(ActivityService activityService, DemoContext demoContext) {
        this.activityService = activityService;
        this.demoContext = demoContext;
    }

    @GetMapping("/api/activity")
    public List<ActivityDTO> getActivity(@RequestParam(required = false) Long companyId) {

        Long resolvedCompanyId = demoContext.getCompanyId();

        if (resolvedCompanyId == null) {
            resolvedCompanyId = companyId;
        }

        if (resolvedCompanyId != null) {
            return activityService.findByCompany(resolvedCompanyId);
        }

        return List.of();
    }
}