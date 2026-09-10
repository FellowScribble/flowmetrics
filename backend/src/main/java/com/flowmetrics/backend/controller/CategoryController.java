package com.flowmetrics.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import com.flowmetrics.backend.dto.CategoryDTO;
import com.flowmetrics.backend.dto.CreateCategoryDTO;
import com.flowmetrics.backend.service.CategoryService;
import com.flowmetrics.backend.context.DemoContext;
import com.flowmetrics.backend.exception.ResourceNotFoundException;

@RestController
public class CategoryController {

    private final CategoryService categoryService;
    private final DemoContext demoContext;

    public CategoryController(CategoryService categoryService, DemoContext demoContext) {
        this.categoryService = categoryService;
        this.demoContext = demoContext;
    }

    @GetMapping("/api/categories")
    public List<CategoryDTO> getCategories(@RequestParam(required = false) Long companyId) {

        Long resolvedCompanyId = demoContext.getCompanyId();

        if (resolvedCompanyId == null) {
            resolvedCompanyId = companyId;
        }

        if (resolvedCompanyId != null) {
            return categoryService.findByCompany(resolvedCompanyId);
        }

        return categoryService.findAll();
    }

    @GetMapping("/api/categories/{id}")
    public CategoryDTO getCategoryById(@PathVariable Long id) {
        CategoryDTO category = categoryService.findById(id);
        checkOwnership(category.getCompanyId(), id);
        return category;
    }

    @PostMapping("/api/categories")
    public CategoryDTO createCategory(@RequestBody CreateCategoryDTO dto) {

        Long sessionCompanyId = demoContext.getCompanyId();
        if (sessionCompanyId != null) {
            dto.setCompanyId(sessionCompanyId);
        }

        return categoryService.create(dto);
    }

    @PutMapping("/api/categories/{id}")
    public CategoryDTO updateCategory(@PathVariable Long id, @RequestBody CreateCategoryDTO dto) {

        CategoryDTO existing = categoryService.findById(id);
        checkOwnership(existing.getCompanyId(), id);

        Long sessionCompanyId = demoContext.getCompanyId();
        if (sessionCompanyId != null) {
            dto.setCompanyId(sessionCompanyId);
        }

        return categoryService.update(id, dto);
    }

    @DeleteMapping("/api/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {

        CategoryDTO existing = categoryService.findById(id);
        checkOwnership(existing.getCompanyId(), id);

        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private void checkOwnership(Long resourceCompanyId, Long resourceId) {
        Long sessionCompanyId = demoContext.getCompanyId();

        if (sessionCompanyId != null && !sessionCompanyId.equals(resourceCompanyId)) {
            throw new ResourceNotFoundException("Categoría no encontrada con id " + resourceId);
        }
    }
}