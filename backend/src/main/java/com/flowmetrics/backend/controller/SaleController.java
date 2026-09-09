package com.flowmetrics.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import com.flowmetrics.backend.dto.SaleDTO;
import com.flowmetrics.backend.dto.CreateSaleDTO;
import com.flowmetrics.backend.service.SaleService;

@RestController
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    @GetMapping("/api/sales")
    public List<SaleDTO> getSales(@RequestParam(required = false) Long companyId) {
        if (companyId != null) {
            return saleService.findByCompany(companyId);
        }
        return saleService.findAll();
    }

    @GetMapping("/api/sales/{id}")
    public SaleDTO getSaleById(@PathVariable Long id) {
        return saleService.findById(id);
    }

    @PostMapping("/api/sales")
    public SaleDTO createSale(@RequestBody CreateSaleDTO dto) {
        return saleService.create(dto);
    }

    @PutMapping("/api/sales/{id}")
    public SaleDTO updateSale(@PathVariable Long id, @RequestBody CreateSaleDTO dto) {
        return saleService.update(id, dto);
    }

    @DeleteMapping("/api/sales/{id}")
    public ResponseEntity<Void> deleteSale(@PathVariable Long id) {
        saleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}