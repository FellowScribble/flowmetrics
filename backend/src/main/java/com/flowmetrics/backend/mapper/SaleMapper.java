package com.flowmetrics.backend.mapper;

import com.flowmetrics.backend.dto.SaleDTO;
import com.flowmetrics.backend.dto.SaleItemDTO;
import com.flowmetrics.backend.entity.Sale;
import com.flowmetrics.backend.entity.SaleItem;

public class SaleMapper {

    public static SaleDTO toDTO(Sale sale) {
        SaleDTO dto = new SaleDTO();
        dto.setId(sale.getId());
        dto.setCompanyId(sale.getCompany().getId());
        dto.setCustomerId(sale.getCustomer().getId());
        dto.setSaleDate(sale.getSaleDate());
        dto.setTotal(sale.getTotal());
        dto.setPaymentMethod(sale.getPaymentMethod());
        dto.setPaymentStatus(sale.getPaymentStatus());
        dto.setStatus(sale.getStatus());
        dto.setNotes(sale.getNotes());
        dto.setCreatedAt(sale.getCreatedAt());
        dto.setUpdatedAt(sale.getUpdatedAt());
        dto.setItems(sale.getItems().stream().map(SaleMapper::itemToDTO).toList());
        return dto;
    }

    private static SaleItemDTO itemToDTO(SaleItem item) {
        SaleItemDTO dto = new SaleItemDTO();
        dto.setId(item.getId());
        dto.setProductId(item.getProduct().getId());
        dto.setProductName(item.getProduct().getName());
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setSubtotal(item.getSubtotal());
        return dto;
    }
}