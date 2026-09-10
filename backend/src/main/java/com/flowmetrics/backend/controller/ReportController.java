package com.flowmetrics.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.flowmetrics.backend.dto.SalesSummaryDTO;
import com.flowmetrics.backend.dto.MonthlySalesDTO;
import com.flowmetrics.backend.dto.TopProductDTO;
import com.flowmetrics.backend.service.ReportService;
import com.flowmetrics.backend.context.DemoContext;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;
    private final DemoContext demoContext;

    public ReportController(ReportService reportService, DemoContext demoContext) {
        this.reportService = reportService;
        this.demoContext = demoContext;
    }

    @GetMapping("/summary")
    public SalesSummaryDTO getSummary(@RequestParam(required = false) Long companyId) {
        return reportService.getSummary(resolveCompanyId(companyId));
    }

    @GetMapping("/sales-by-month")
    public List<MonthlySalesDTO> getSalesByMonth(@RequestParam(required = false) Long companyId) {
        return reportService.getSalesByMonth(resolveCompanyId(companyId));
    }

    @GetMapping("/top-products")
    public List<TopProductDTO> getTopProducts(@RequestParam(required = false) Long companyId) {
        return reportService.getTopProducts(resolveCompanyId(companyId));
    }

    private Long resolveCompanyId(Long companyId) {
        Long sessionCompanyId = demoContext.getCompanyId();
        return (sessionCompanyId != null) ? sessionCompanyId : companyId;
    }
}