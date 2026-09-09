package com.flowmetrics.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import com.flowmetrics.backend.dto.ProductDTO;
import com.flowmetrics.backend.dto.CreateProductDTO;
import com.flowmetrics.backend.service.ProductService;

@RestController
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping("/api/products")
    public List<ProductDTO> getProducts(@RequestParam(required = false) Long companyId) {
        if (companyId != null) {
            return productService.findByCompany(companyId);
        }
        return productService.findAll();
    }

    @GetMapping("/api/products/{id}")
    public ProductDTO getProductById(@PathVariable Long id) {
        return productService.findById(id);
    }

    @PostMapping("/api/products")
    public ProductDTO createProduct(@RequestBody CreateProductDTO dto) {
        return productService.create(dto);
    }

    @PutMapping("/api/products/{id}")
    public ProductDTO updateProduct(@PathVariable Long id, @RequestBody CreateProductDTO dto) {
        return productService.update(id, dto);
    }

    @DeleteMapping("/api/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}