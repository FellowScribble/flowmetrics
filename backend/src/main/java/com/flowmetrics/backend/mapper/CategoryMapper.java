package com.flowmetrics.backend.mapper;

import com.flowmetrics.backend.dto.CategoryDTO;
import com.flowmetrics.backend.entity.Category;

public class CategoryMapper {

    public static CategoryDTO toDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setCompanyId(category.getCompany().getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setCreatedAt(category.getCreatedAt());
        dto.setUpdatedAt(category.getUpdatedAt());
        return dto;
    }
}