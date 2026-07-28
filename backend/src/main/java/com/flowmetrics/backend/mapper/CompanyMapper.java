package com.flowmetrics.backend.mapper;

import com.flowmetrics.backend.dto.CompanyDTO;
import com.flowmetrics.backend.entity.Company;

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

}