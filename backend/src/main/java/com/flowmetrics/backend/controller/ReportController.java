package com.flowmetrics.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.flowmetrics.backend.dto.SalesSummaryDTO;
import com.flowmetrics.backend.dto.MonthlySalesDTO;
import com.flowmetrics.backend.dto.TopProductDTO;
import com.flowmetrics.backend.service.ReportService;
import com.flowmetrics.backend.context.SessionGuard;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final SessionGuard sessionGuard;

    public ReportController(ReportService reportService, SessionGuard sessionGuard) {
        this.reportService = reportService;
        this.sessionGuard = sessionGuard;
    }

    @GetMapping("/summary")
    public SalesSummaryDTO getSummary() {
        return reportService.getSummary(sessionGuard.requireCompanyId());
    }

    @GetMapping("/sales-by-month")
    public List<MonthlySalesDTO> getSalesByMonth() {
        return reportService.getSalesByMonth(sessionGuard.requireCompanyId());
    }

    @GetMapping("/top-products")
    public List<TopProductDTO> getTopProducts() {
        return reportService.getTopProducts(sessionGuard.requireCompanyId());
    }
}
