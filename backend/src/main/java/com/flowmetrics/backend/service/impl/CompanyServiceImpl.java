package com.flowmetrics.backend.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.flowmetrics.backend.repository.CompanyRepository;
import com.flowmetrics.backend.service.CompanyService;
import com.flowmetrics.backend.dto.CompanyDTO;
import com.flowmetrics.backend.mapper.CompanyMapper;

@Service
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;

    public CompanyServiceImpl(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    @Override
    public List<CompanyDTO> findAll() {

        return companyRepository.findAll()
                .stream()
                .map(CompanyMapper::toDTO)
                .toList();

    }

}