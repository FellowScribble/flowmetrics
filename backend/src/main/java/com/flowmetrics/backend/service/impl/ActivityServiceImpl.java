package com.flowmetrics.backend.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.flowmetrics.backend.repository.ActivityRepository;
import com.flowmetrics.backend.repository.CompanyRepository;
import com.flowmetrics.backend.service.ActivityService;
import com.flowmetrics.backend.dto.ActivityDTO;
import com.flowmetrics.backend.mapper.ActivityMapper;
import com.flowmetrics.backend.entity.Activity;
import com.flowmetrics.backend.entity.Company;
import com.flowmetrics.backend.exception.ResourceNotFoundException;

@Service
public class ActivityServiceImpl implements ActivityService {

    private final ActivityRepository activityRepository;
    private final CompanyRepository companyRepository;

    public ActivityServiceImpl(ActivityRepository activityRepository, CompanyRepository companyRepository) {
        this.activityRepository = activityRepository;
        this.companyRepository = companyRepository;
    }

    @Override
    public List<ActivityDTO> findByCompany(Long companyId) {
        return activityRepository.findByCompanyIdOrderByCreatedAtDesc(companyId)
                .stream()
                .map(ActivityMapper::toDTO)
                .toList();
    }

    @Override
    public void log(Long companyId, String title, String description, String type, String entityType, Long entityId) {

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Empresa no encontrada con id " + companyId));

        Activity activity = new Activity();
        activity.setCompany(company);
        activity.setTitle(title);
        activity.setDescription(description);
        activity.setType(type);
        activity.setEntityType(entityType);
        activity.setEntityId(entityId);

        activityRepository.save(activity);
    }
}