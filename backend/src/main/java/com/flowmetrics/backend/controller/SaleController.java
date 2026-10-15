package com.flowmetrics.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import com.flowmetrics.backend.dto.SaleDTO;
import com.flowmetrics.backend.dto.CreateSaleDTO;
import com.flowmetrics.backend.service.SaleService;
import com.flowmetrics.backend.context.SessionGuard;

@RestController
public class SaleController {

    private final SaleService saleService;
    private final SessionGuard sessionGuard;

    public SaleController(SaleService saleService, SessionGuard sessionGuard) {
        this.saleService = saleService;
        this.sessionGuard = sessionGuard;
    }

    @GetMapping("/api/sales")
    public List<SaleDTO> getSales() {
        return saleService.findByCompany(sessionGuard.requireCompanyId());
    }

    @GetMapping("/api/sales/{id}")
    public SaleDTO getSaleById(@PathVariable Long id) {
        SaleDTO sale = saleService.findById(id);
        sessionGuard.requireOwnership(sale.getCompanyId(), "Venta", id);
        return sale;
    }

    @PostMapping("/api/sales")
    public SaleDTO createSale(@RequestBody CreateSaleDTO dto) {
        dto.setCompanyId(sessionGuard.requireCompanyId());
        return saleService.create(dto);
    }

    @PutMapping("/api/sales/{id}")
    public SaleDTO updateSale(@PathVariable Long id, @RequestBody CreateSaleDTO dto) {
        SaleDTO existing = saleService.findById(id);
        sessionGuard.requireOwnership(existing.getCompanyId(), "Venta", id);

        dto.setCompanyId(sessionGuard.requireCompanyId());
        return saleService.update(id, dto);
    }

    @DeleteMapping("/api/sales/{id}")
    public ResponseEntity<Void> deleteSale(@PathVariable Long id) {
        SaleDTO existing = saleService.findById(id);
        sessionGuard.requireOwnership(existing.getCompanyId(), "Venta", id);

        saleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
