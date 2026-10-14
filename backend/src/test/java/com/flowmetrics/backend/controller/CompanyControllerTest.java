package com.flowmetrics.backend.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.flowmetrics.backend.context.DemoContext;
import com.flowmetrics.backend.dto.CompanyDTO;
import com.flowmetrics.backend.exception.ResourceNotFoundException;
import com.flowmetrics.backend.service.CompanyService;

@ExtendWith(MockitoExtension.class)
class CompanyControllerTest {

    @Mock private CompanyService companyService;

    private DemoContext demoContext;
    private CompanyController controller;

    @BeforeEach
    void setUp() {
        demoContext = new DemoContext();
        controller = new CompanyController(companyService, demoContext);
    }

    @Test
    void getCompanies_sinSesion_lanzaNotFound() {
        assertThrows(ResourceNotFoundException.class, () -> controller.getCompanies());
        verify(companyService, never()).findById(anyLong());
    }

    @Test
    void getCompanies_conSesion_devuelveSoloLaPropia() {
        demoContext.setCompanyId(1L);
        when(companyService.findById(1L)).thenReturn(dto(1L, "Mi empresa"));

        List<CompanyDTO> result = controller.getCompanies();

        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
    }

    @Test
    void getCompanyById_deOtraEmpresa_lanzaNotFound() {
        demoContext.setCompanyId(1L);

        assertThrows(ResourceNotFoundException.class, () -> controller.getCompanyById(2L));
        verify(companyService, never()).findById(anyLong());
    }

    @Test
    void getCompanyById_propia_devuelve() {
        demoContext.setCompanyId(1L);
        when(companyService.findById(1L)).thenReturn(dto(1L, "Mi empresa"));

        CompanyDTO result = controller.getCompanyById(1L);

        assertEquals(1L, result.getId());
    }

    private static CompanyDTO dto(Long id, String name) {
        return new CompanyDTO(id, name, "Coffee Shop", "España", "EUR");
    }
}
