package com.flowmetrics.backend.mapper;

import com.flowmetrics.backend.dto.ActivityDTO;
import com.flowmetrics.backend.entity.Activity;

public class ActivityMapper {

    public static ActivityDTO toDTO(Activity activity) {
        ActivityDTO dto = new ActivityDTO();
        dto.setId(activity.getId());
        dto.setCompanyId(activity.getCompany().getId());
        dto.setTitle(activity.getTitle());
        dto.setDescription(activity.getDescription());
        dto.setType(activity.getType());
        dto.setEntityType(activity.getEntityType());
        dto.setEntityId(activity.getEntityId());
        dto.setCreatedAt(activity.getCreatedAt());
        return dto;
    }
}