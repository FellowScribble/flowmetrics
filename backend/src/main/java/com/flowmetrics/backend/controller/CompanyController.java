package com.flowmetrics.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flowmetrics.backend.dto.CompanyDTO;
import com.flowmetrics.backend.service.CompanyService;

@RestController
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @GetMapping("/api/companies")
    public List<CompanyDTO> getCompanies() {
        return companyService.findAll();
    }

}
