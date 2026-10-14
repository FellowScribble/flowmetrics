package com.flowmetrics.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;

import com.flowmetrics.backend.dto.CompanyDTO;
import com.flowmetrics.backend.service.CompanyService;
import com.flowmetrics.backend.context.DemoContext;
import com.flowmetrics.backend.exception.ResourceNotFoundException;

@RestController
public class CompanyController {

    private final CompanyService companyService;
    private final DemoContext demoContext;

    public CompanyController(CompanyService companyService, DemoContext demoContext) {
        this.companyService = companyService;
        this.demoContext = demoContext;
    }

    @GetMapping("/api/companies")
    public List<CompanyDTO> getCompanies() {

        return List.of(companyService.findById(requireSession()));

    }

    @GetMapping("/api/companies/{id}")
    public CompanyDTO getCompanyById(@PathVariable Long id) {

        Long sessionCompanyId = requireSession();

        if (!sessionCompanyId.equals(id)) {
            throw new ResourceNotFoundException("Empresa no encontrada con id " + id);
        }

        return companyService.findById(id);

    }

    private Long requireSession() {
        Long sessionCompanyId = demoContext.getCompanyId();

        if (sessionCompanyId == null) {
            throw new ResourceNotFoundException("Empresa no encontrada");
        }

        return sessionCompanyId;
    }

}
