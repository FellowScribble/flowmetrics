package com.flowmetrics.backend.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.flowmetrics.backend.repository.CategoryRepository;
import com.flowmetrics.backend.repository.CompanyRepository;
import com.flowmetrics.backend.service.CategoryService;
import com.flowmetrics.backend.dto.CategoryDTO;
import com.flowmetrics.backend.dto.CreateCategoryDTO;
import com.flowmetrics.backend.mapper.CategoryMapper;
import com.flowmetrics.backend.entity.Category;
import com.flowmetrics.backend.entity.Company;
import com.flowmetrics.backend.exception.ResourceNotFoundException;

@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final CompanyRepository companyRepository;

    public CategoryServiceImpl(CategoryRepository categoryRepository, CompanyRepository companyRepository) {
        this.categoryRepository = categoryRepository;
        this.companyRepository = companyRepository;
    }

    @Override
    public List<CategoryDTO> findAll() {
        return categoryRepository.findAll()
                .stream()
                .map(CategoryMapper::toDTO)
                .toList();
    }

    @Override
    public List<CategoryDTO> findByCompany(Long companyId) {
        return categoryRepository.findAll()
                .stream()
                .filter(c -> c.getCompany().getId().equals(companyId))
                .map(CategoryMapper::toDTO)
                .toList();
    }

    @Override
    public CategoryDTO findById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con id " + id));

        return CategoryMapper.toDTO(category);
    }

    @Override
    public CategoryDTO create(CreateCategoryDTO dto) {

        Company company = companyRepository.findById(dto.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Empresa no encontrada con id " + dto.getCompanyId()));

        Category category = new Category();
        category.setCompany(company);
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());

        Category savedCategory = categoryRepository.save(category);

        return CategoryMapper.toDTO(savedCategory);
    }

    @Override
    public CategoryDTO update(Long id, CreateCategoryDTO dto) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con id " + id));

        Company company = companyRepository.findById(dto.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Empresa no encontrada con id " + dto.getCompanyId()));

        category.setCompany(company);
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());

        Category updatedCategory = categoryRepository.save(category);

        return CategoryMapper.toDTO(updatedCategory);
    }

    @Override
    public void delete(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con id " + id));

        categoryRepository.delete(category);
    }
}