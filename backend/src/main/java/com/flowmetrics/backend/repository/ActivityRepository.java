package com.flowmetrics.backend.repository;

import java.util.List;


import org.springframework.data.jpa.repository.JpaRepository;
import com.flowmetrics.backend.entity.Activity;

public interface ActivityRepository extends JpaRepository<Activity, Long> {

    List<Activity> findByCompanyIdOrderByCreatedAtDesc(Long companyId);
    List<Activity> findByCompanyId(Long companyId);
}