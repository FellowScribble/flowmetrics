package com.flowmetrics.backend.service;

import com.flowmetrics.backend.entity.Company;

public interface CompanyCloningService {

    Company cloneCompany(Company template);
}