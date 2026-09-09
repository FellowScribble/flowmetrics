package com.flowmetrics.backend.service;

import java.util.List;

import com.flowmetrics.backend.dto.CompanyDTO;
import com.flowmetrics.backend.dto.CreateCompanyDTO;

public interface CompanyService {

    List<CompanyDTO> findAll();
    
    CompanyDTO findById(Long id);
    
    CompanyDTO create(CreateCompanyDTO dto);

    CompanyDTO update(Long id, CreateCompanyDTO dto);

    void delete(Long id);
}
