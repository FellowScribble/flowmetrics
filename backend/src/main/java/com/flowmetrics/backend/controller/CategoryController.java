package com.flowmetrics.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import com.flowmetrics.backend.dto.CategoryDTO;
import com.flowmetrics.backend.dto.CreateCategoryDTO;
import com.flowmetrics.backend.service.CategoryService;

@RestController
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping("/api/categories")
    public List<CategoryDTO> getCategories(@RequestParam(required = false) Long companyId) {
        if (companyId != null) {
            return categoryService.findByCompany(companyId);
        }
        return categoryService.findAll();
    }

    @GetMapping("/api/categories/{id}")
    public CategoryDTO getCategoryById(@PathVariable Long id) {
        return categoryService.findById(id);
    }

    @PostMapping("/api/categories")
    public CategoryDTO createCategory(@RequestBody CreateCategoryDTO dto) {
        return categoryService.create(dto);
    }

    @PutMapping("/api/categories/{id}")
    public CategoryDTO updateCategory(@PathVariable Long id, @RequestBody CreateCategoryDTO dto) {
        return categoryService.update(id, dto);
    }

    @DeleteMapping("/api/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}