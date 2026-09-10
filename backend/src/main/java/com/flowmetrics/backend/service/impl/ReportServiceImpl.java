package com.flowmetrics.backend.service.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.flowmetrics.backend.repository.SaleRepository;
import com.flowmetrics.backend.repository.SaleItemRepository;
import com.flowmetrics.backend.repository.CustomerRepository;
import com.flowmetrics.backend.repository.ProductRepository;
import com.flowmetrics.backend.service.ReportService;
import com.flowmetrics.backend.dto.SalesSummaryDTO;
import com.flowmetrics.backend.dto.MonthlySalesDTO;
import com.flowmetrics.backend.dto.TopProductDTO;

@Service
public class ReportServiceImpl implements ReportService {

    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;

    public ReportServiceImpl(SaleRepository saleRepository,
                              SaleItemRepository saleItemRepository,
                              CustomerRepository customerRepository,
                              ProductRepository productRepository) {
        this.saleRepository = saleRepository;
        this.saleItemRepository = saleItemRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
    }

    @Override
    public SalesSummaryDTO getSummary(Long companyId) {

        BigDecimal totalRevenue = saleRepository.getTotalRevenue(companyId);

        LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        BigDecimal revenueThisMonth = saleRepository.getRevenueSince(companyId, startOfMonth);

        long activeCustomers = customerRepository.countByCompanyIdAndIsActiveTrue(companyId);
        long lowStockProducts = productRepository.countLowStock(companyId);

        return new SalesSummaryDTO(totalRevenue, revenueThisMonth, activeCustomers, lowStockProducts);
    }

    @Override
    public List<MonthlySalesDTO> getSalesByMonth(Long companyId) {
        List<Object[]> rows = saleRepository.getSalesByMonth(companyId);

        return rows.stream()
                .map(row -> new MonthlySalesDTO((String) row[0], (BigDecimal) row[1]))
                .toList();
    }

    @Override
    public List<TopProductDTO> getTopProducts(Long companyId) {
        List<Object[]> rows = saleItemRepository.getTopProducts(companyId);

        return rows.stream()
                .map(row -> new TopProductDTO(
                        (String) row[0],
                        ((Number) row[1]).longValue(),
                        (BigDecimal) row[2]
                ))
                .toList();
    }
}