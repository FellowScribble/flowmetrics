package com.flowmetrics.backend.service;

import java.util.List;

import com.flowmetrics.backend.dto.CompanyDTO;

public interface CompanyService {

    List<CompanyDTO> findAll();

}
