package com.flowmetrics.backend.dto;

public class CreateSaleItemDTO {

    private Long productId;
    private Integer quantity;

    public CreateSaleItemDTO() {
    }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
}