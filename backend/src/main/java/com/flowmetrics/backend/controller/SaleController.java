package com.flowmetrics.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import com.flowmetrics.backend.dto.SaleDTO;
import com.flowmetrics.backend.dto.CreateSaleDTO;
import com.flowmetrics.backend.service.SaleService;
import com.flowmetrics.backend.context.DemoContext;
import com.flowmetrics.backend.exception.ResourceNotFoundException;

@RestController
public class SaleController {

    private final SaleService saleService;
    private final DemoContext demoContext;

    public SaleController(SaleService saleService, DemoContext demoContext) {
        this.saleService = saleService;
        this.demoContext = demoContext;
    }

    @GetMapping("/api/sales")
    public List<SaleDTO> getSales(@RequestParam(required = false) Long companyId) {

        Long resolvedCompanyId = demoContext.getCompanyId();

        if (resolvedCompanyId == null) {
            resolvedCompanyId = companyId;
        }

        if (resolvedCompanyId != null) {
            return saleService.findByCompany(resolvedCompanyId);
        }

        return saleService.findAll();
    }

    @GetMapping("/api/sales/{id}")
    public SaleDTO getSaleById(@PathVariable Long id) {
        SaleDTO sale = saleService.findById(id);
        checkOwnership(sale.getCompanyId(), id);
        return sale;
    }

    @PostMapping("/api/sales")
    public SaleDTO createSale(@RequestBody CreateSaleDTO dto) {

        Long sessionCompanyId = demoContext.getCompanyId();
        if (sessionCompanyId != null) {
            dto.setCompanyId(sessionCompanyId);
        }

        return saleService.create(dto);
    }

    @PutMapping("/api/sales/{id}")
    public SaleDTO updateSale(@PathVariable Long id, @RequestBody CreateSaleDTO dto) {

        SaleDTO existing = saleService.findById(id);
        checkOwnership(existing.getCompanyId(), id);

        Long sessionCompanyId = demoContext.getCompanyId();
        if (sessionCompanyId != null) {
            dto.setCompanyId(sessionCompanyId);
        }

        return saleService.update(id, dto);
    }

    @DeleteMapping("/api/sales/{id}")
    public ResponseEntity<Void> deleteSale(@PathVariable Long id) {

        SaleDTO existing = saleService.findById(id);
        checkOwnership(existing.getCompanyId(), id);

        saleService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private void checkOwnership(Long resourceCompanyId, Long resourceId) {
        Long sessionCompanyId = demoContext.getCompanyId();

        if (sessionCompanyId != null && !sessionCompanyId.equals(resourceCompanyId)) {
            throw new ResourceNotFoundException("Venta no encontrada con id " + resourceId);
        }
    }
}