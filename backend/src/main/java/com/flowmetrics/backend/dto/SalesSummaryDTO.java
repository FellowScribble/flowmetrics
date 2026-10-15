package com.flowmetrics.backend.dto;

import java.math.BigDecimal;

public class SalesSummaryDTO {

    private BigDecimal totalRevenue;
    private BigDecimal revenueThisMonth;
    private long activeCustomers;
    private long lowStockProducts;

    public SalesSummaryDTO() {
    }

    public SalesSummaryDTO(BigDecimal totalRevenue, BigDecimal revenueThisMonth, long activeCustomers, long lowStockProducts) {
        this.totalRevenue = totalRevenue;
        this.revenueThisMonth = revenueThisMonth;
        this.activeCustomers = activeCustomers;
        this.lowStockProducts = lowStockProducts;
    }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }

    public BigDecimal getRevenueThisMonth() { return revenueThisMonth; }
    public void setRevenueThisMonth(BigDecimal revenueThisMonth) { this.revenueThisMonth = revenueThisMonth; }

    public long getActiveCustomers() { return activeCustomers; }
    public void setActiveCustomers(long activeCustomers) { this.activeCustomers = activeCustomers; }

    public long getLowStockProducts() { return lowStockProducts; }
    public void setLowStockProducts(long lowStockProducts) { this.lowStockProducts = lowStockProducts; }
}