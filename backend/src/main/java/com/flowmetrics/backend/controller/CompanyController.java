package com.flowmetrics.backend.controller;

import java.util.List;


import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.flowmetrics.backend.dto.CompanyDTO;
import com.flowmetrics.backend.service.CompanyService;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.flowmetrics.backend.dto.CreateCompanyDTO;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.http.ResponseEntity;

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
    
    @GetMapping("/api/companies/{id}")
    public CompanyDTO getCompanyById(@PathVariable Long id) {

        return companyService.findById(id);

    }
    
    @PostMapping("/api/companies")
    public CompanyDTO createCompany(@RequestBody CreateCompanyDTO dto) {

        return companyService.create(dto);

    }
    
    @PutMapping("/api/companies/{id}")
    public CompanyDTO updateCompany(@PathVariable Long id, @RequestBody CreateCompanyDTO dto) {
        return companyService.update(id, dto);
    }

    @DeleteMapping("/api/companies/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        companyService.delete(id);
        return ResponseEntity.noContent().build();
    }

}
