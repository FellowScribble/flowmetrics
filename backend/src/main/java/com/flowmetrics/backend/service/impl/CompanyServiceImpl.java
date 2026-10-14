package com.flowmetrics.backend.service.impl;

import java.util.List;
import com.flowmetrics.backend.exception.ResourceNotFoundException;
import com.flowmetrics.backend.exception.TemplateCompanyProtectedException;

import org.springframework.stereotype.Service;

import com.flowmetrics.backend.repository.CompanyRepository;
import com.flowmetrics.backend.service.CompanyService;
import com.flowmetrics.backend.dto.CompanyDTO;
import com.flowmetrics.backend.mapper.CompanyMapper;
import com.flowmetrics.backend.entity.Company;
import com.flowmetrics.backend.dto.CreateCompanyDTO;

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
    
    @Override
    public CompanyDTO findById(Long id) {

    	Company company = companyRepository.findById(id)
    	        .orElseThrow(() -> new ResourceNotFoundException("Empresa no encontrada con id " + id));

        return CompanyMapper.toDTO(company);
    }
    
    @Override
    public CompanyDTO create(CreateCompanyDTO dto) {

        Company company = CompanyMapper.toEntity(dto);

        Company savedCompany = companyRepository.save(company);

        return CompanyMapper.toDTO(savedCompany);

    }
    
    @Override
    public CompanyDTO update(Long id, CreateCompanyDTO dto) {

        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Empresa no encontrada con id " + id));

        if (Boolean.TRUE.equals(company.getIsTemplate())) {
            throw new TemplateCompanyProtectedException("No se puede modificar la empresa plantilla.");
        }

        company.setName(dto.getName());
        company.setIndustry(dto.getIndustry());
        company.setCountry(dto.getCountry());
        company.setCurrency(dto.getCurrency());

        Company updatedCompany = companyRepository.save(company);

        return CompanyMapper.toDTO(updatedCompany);
    }

    @Override
    public void delete(Long id) {

        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Empresa no encontrada con id " + id));

        if (Boolean.TRUE.equals(company.getIsTemplate())) {
            throw new TemplateCompanyProtectedException("No se puede eliminar la empresa plantilla.");
        }

        companyRepository.delete(company);
    }

}