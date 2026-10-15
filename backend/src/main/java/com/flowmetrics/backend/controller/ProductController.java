package com.flowmetrics.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import com.flowmetrics.backend.dto.ProductDTO;
import com.flowmetrics.backend.dto.CreateProductDTO;
import com.flowmetrics.backend.service.ProductService;
import com.flowmetrics.backend.context.SessionGuard;

@RestController
public class ProductController {

    private final ProductService productService;
    private final SessionGuard sessionGuard;

    public ProductController(ProductService productService, SessionGuard sessionGuard) {
        this.productService = productService;
        this.sessionGuard = sessionGuard;
    }

    @GetMapping("/api/products")
    public List<ProductDTO> getProducts() {
        return productService.findByCompany(sessionGuard.requireCompanyId());
    }

    @GetMapping("/api/products/{id}")
    public ProductDTO getProductById(@PathVariable Long id) {
        ProductDTO product = productService.findById(id);
        sessionGuard.requireOwnership(product.getCompanyId(), "Producto", id);
        return product;
    }

    @PostMapping("/api/products")
    public ProductDTO createProduct(@RequestBody CreateProductDTO dto) {
        dto.setCompanyId(sessionGuard.requireCompanyId());
        return productService.create(dto);
    }

    @PutMapping("/api/products/{id}")
    public ProductDTO updateProduct(@PathVariable Long id, @RequestBody CreateProductDTO dto) {
        ProductDTO existing = productService.findById(id);
        sessionGuard.requireOwnership(existing.getCompanyId(), "Producto", id);

        dto.setCompanyId(sessionGuard.requireCompanyId());
        return productService.update(id, dto);
    }

    @DeleteMapping("/api/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        ProductDTO existing = productService.findById(id);
        sessionGuard.requireOwnership(existing.getCompanyId(), "Producto", id);

        productService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
