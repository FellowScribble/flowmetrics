package com.flowmetrics.backend.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.flowmetrics.backend.dto.CompanyDTO;
import com.flowmetrics.backend.dto.CreateCompanyDTO;
import com.flowmetrics.backend.entity.Company;
import com.flowmetrics.backend.exception.TemplateCompanyProtectedException;
import com.flowmetrics.backend.repository.CompanyRepository;

@ExtendWith(MockitoExtension.class)
class CompanyServiceImplTest {

    @Mock private CompanyRepository companyRepository;

    @InjectMocks private CompanyServiceImpl companyService;

    @Test
    void update_empresaPlantilla_lanzaConflicto() {
        Company template = company(1L, "FlowMetrics Demo", true);
        when(companyRepository.findById(1L)).thenReturn(Optional.of(template));

        CreateCompanyDTO dto = dto("Otro nombre");

        assertThrows(TemplateCompanyProtectedException.class, () -> companyService.update(1L, dto));
        assertEquals("FlowMetrics Demo", template.getName());
        verify(companyRepository, never()).save(any());
    }

    @Test
    void delete_empresaPlantilla_lanzaConflicto() {
        Company template = company(1L, "FlowMetrics Demo", true);
        when(companyRepository.findById(1L)).thenReturn(Optional.of(template));

        assertThrows(TemplateCompanyProtectedException.class, () -> companyService.delete(1L));
        verify(companyRepository, never()).delete(any());
    }

    @Test
    void update_empresaNormal_actualiza() {
        Company normal = company(2L, "Antiguo", false);
        when(companyRepository.findById(2L)).thenReturn(Optional.of(normal));
        when(companyRepository.save(any(Company.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CreateCompanyDTO dto = dto("Nuevo");

        CompanyDTO result = companyService.update(2L, dto);

        assertNotNull(result);
        assertEquals("Nuevo", normal.getName());
        verify(companyRepository).save(normal);
    }

    @Test
    void delete_empresaNormal_elimina() {
        Company normal = company(2L, "Normal", false);
        when(companyRepository.findById(2L)).thenReturn(Optional.of(normal));

        companyService.delete(2L);

        verify(companyRepository).delete(normal);
    }

    private static Company company(Long id, String name, boolean isTemplate) {
        Company company = new Company();
        company.setId(id);
        company.setName(name);
        company.setIndustry("Coffee Shop");
        company.setCountry("España");
        company.setCurrency("EUR");
        company.setIsTemplate(isTemplate);
        return company;
    }

    private static CreateCompanyDTO dto(String name) {
        CreateCompanyDTO dto = new CreateCompanyDTO();
        dto.setName(name);
        dto.setIndustry("Coffee Shop");
        dto.setCountry("España");
        dto.setCurrency("EUR");
        return dto;
    }
}
