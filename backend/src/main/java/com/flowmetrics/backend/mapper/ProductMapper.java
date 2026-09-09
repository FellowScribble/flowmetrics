package com.flowmetrics.backend.mapper;

import com.flowmetrics.backend.dto.ProductDTO;
import com.flowmetrics.backend.entity.Product;

public class ProductMapper {

    public static ProductDTO toDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.getId());
        dto.setCompanyId(product.getCompany().getId());
        dto.setCategoryId(product.getCategory().getId());
        dto.setName(product.getName());
        dto.setSalePrice(product.getSalePrice());
        dto.setCostPrice(product.getCostPrice());
        dto.setStock(product.getStock());
        dto.setMinimumStock(product.getMinimumStock());
        dto.setIsActive(product.getIsActive());
        dto.setCreatedAt(product.getCreatedAt());
        dto.setUpdatedAt(product.getUpdatedAt());
        return dto;
    }
}