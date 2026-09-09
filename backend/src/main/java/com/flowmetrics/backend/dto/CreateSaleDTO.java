package com.flowmetrics.backend.dto;

import java.util.List;

public class CreateSaleDTO {

    private Long companyId;
    private Long customerId;
    private String paymentMethod;
    private String paymentStatus;
    private String status;
    private String notes;
    private List<CreateSaleItemDTO> items;

    public CreateSaleDTO() {
    }

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }

    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<CreateSaleItemDTO> getItems() { return items; }
    public void setItems(List<CreateSaleItemDTO> items) { this.items = items; }
}