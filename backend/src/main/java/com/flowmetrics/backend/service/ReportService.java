package com.flowmetrics.backend.service;

import java.util.List;

import com.flowmetrics.backend.dto.SalesSummaryDTO;
import com.flowmetrics.backend.dto.MonthlySalesDTO;
import com.flowmetrics.backend.dto.TopProductDTO;

public interface ReportService {

    SalesSummaryDTO getSummary(Long companyId);

    List<MonthlySalesDTO> getSalesByMonth(Long companyId);

    List<TopProductDTO> getTopProducts(Long companyId);
}