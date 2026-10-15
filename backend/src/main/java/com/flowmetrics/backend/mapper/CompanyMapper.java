package com.flowmetrics.backend.mapper;

import com.flowmetrics.backend.dto.CompanyDTO;

import com.flowmetrics.backend.entity.Company;
import com.flowmetrics.backend.dto.CreateCompanyDTO;

public class CompanyMapper {

    private CompanyMapper() {
    }

    public static CompanyDTO toDTO(Company company) {

        return new CompanyDTO(
                company.getId(),
                company.getName(),
                company.getIndustry(),
                company.getCountry(),
                company.getCurrency()
        );

    }
    
    public static Company toEntity(CreateCompanyDTO dto) {

        Company company = new Company();

        company.setName(dto.getName());
        company.setIndustry(dto.getIndustry());
        company.setCountry(dto.getCountry());
        company.setCurrency(dto.getCurrency());

        company.setIsTemplate(false);

        return company;

    }

}