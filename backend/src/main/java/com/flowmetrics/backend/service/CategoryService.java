package com.flowmetrics.backend.service;

import java.util.List;

import com.flowmetrics.backend.dto.CategoryDTO;
import com.flowmetrics.backend.dto.CreateCategoryDTO;

public interface CategoryService {

    List<CategoryDTO> findAll();

    List<CategoryDTO> findByCompany(Long companyId);

    CategoryDTO findById(Long id);

    CategoryDTO create(CreateCategoryDTO dto);

    CategoryDTO update(Long id, CreateCategoryDTO dto);

    void delete(Long id);
}