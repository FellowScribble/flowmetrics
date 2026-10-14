package com.flowmetrics.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import com.flowmetrics.backend.dto.CategoryDTO;
import com.flowmetrics.backend.dto.CreateCategoryDTO;
import com.flowmetrics.backend.service.CategoryService;
import com.flowmetrics.backend.context.SessionGuard;

@RestController
public class CategoryController {

    private final CategoryService categoryService;
    private final SessionGuard sessionGuard;

    public CategoryController(CategoryService categoryService, SessionGuard sessionGuard) {
        this.categoryService = categoryService;
        this.sessionGuard = sessionGuard;
    }

    @GetMapping("/api/categories")
    public List<CategoryDTO> getCategories() {
        return categoryService.findByCompany(sessionGuard.requireCompanyId());
    }

    @GetMapping("/api/categories/{id}")
    public CategoryDTO getCategoryById(@PathVariable Long id) {
        CategoryDTO category = categoryService.findById(id);
        sessionGuard.requireOwnership(category.getCompanyId(), "Categoría", id);
        return category;
    }

    @PostMapping("/api/categories")
    public CategoryDTO createCategory(@RequestBody CreateCategoryDTO dto) {
        dto.setCompanyId(sessionGuard.requireCompanyId());
        return categoryService.create(dto);
    }

    @PutMapping("/api/categories/{id}")
    public CategoryDTO updateCategory(@PathVariable Long id, @RequestBody CreateCategoryDTO dto) {
        CategoryDTO existing = categoryService.findById(id);
        sessionGuard.requireOwnership(existing.getCompanyId(), "Categoría", id);

        dto.setCompanyId(sessionGuard.requireCompanyId());
        return categoryService.update(id, dto);
    }

    @DeleteMapping("/api/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        CategoryDTO existing = categoryService.findById(id);
        sessionGuard.requireOwnership(existing.getCompanyId(), "Categoría", id);

        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
