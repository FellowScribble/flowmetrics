package com.flowmetrics.backend.dto;

import java.math.BigDecimal;

public class TopProductDTO {

    private String productName;
    private Long totalQuantity;
    private BigDecimal totalRevenue;

    public TopProductDTO() {
    }

    public TopProductDTO(String productName, Long totalQuantity, BigDecimal totalRevenue) {
        this.productName = productName;
        this.totalQuantity = totalQuantity;
        this.totalRevenue = totalRevenue;
    }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public Long getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(Long totalQuantity) { this.totalQuantity = totalQuantity; }

    public BigDecimal getTotalRevenue() { return totalRevenue; }
    public void setTotalRevenue(BigDecimal totalRevenue) { this.totalRevenue = totalRevenue; }
}