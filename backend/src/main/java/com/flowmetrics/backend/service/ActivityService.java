package com.flowmetrics.backend.service;

import java.util.List;

import com.flowmetrics.backend.dto.ActivityDTO;

public interface ActivityService {

    List<ActivityDTO> findByCompany(Long companyId);

    void log(Long companyId, String title, String description, String type, String entityType, Long entityId);
}