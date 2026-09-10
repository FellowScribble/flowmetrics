package com.flowmetrics.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import com.flowmetrics.backend.dto.ProductDTO;
import com.flowmetrics.backend.dto.CreateProductDTO;
import com.flowmetrics.backend.service.ProductService;
import com.flowmetrics.backend.context.DemoContext;
import com.flowmetrics.backend.exception.ResourceNotFoundException;

@RestController
public class ProductController {

    private final ProductService productService;
    private final DemoContext demoContext;

    public ProductController(ProductService productService, DemoContext demoContext) {
        this.productService = productService;
        this.demoContext = demoContext;
    }

    @GetMapping("/api/products")
    public List<ProductDTO> getProducts(@RequestParam(required = false) Long companyId) {

        Long resolvedCompanyId = demoContext.getCompanyId();

        if (resolvedCompanyId == null) {
            resolvedCompanyId = companyId;
        }

        if (resolvedCompanyId != null) {
            return productService.findByCompany(resolvedCompanyId);
        }

        return productService.findAll();
    }

    @GetMapping("/api/products/{id}")
    public ProductDTO getProductById(@PathVariable Long id) {
        ProductDTO product = productService.findById(id);
        checkOwnership(product.getCompanyId(), id);
        return product;
    }

    @PostMapping("/api/products")
    public ProductDTO createProduct(@RequestBody CreateProductDTO dto) {

        Long sessionCompanyId = demoContext.getCompanyId();
        if (sessionCompanyId != null) {
            dto.setCompanyId(sessionCompanyId);
        }

        return productService.create(dto);
    }

    @PutMapping("/api/products/{id}")
    public ProductDTO updateProduct(@PathVariable Long id, @RequestBody CreateProductDTO dto) {

        ProductDTO existing = productService.findById(id);
        checkOwnership(existing.getCompanyId(), id);

        Long sessionCompanyId = demoContext.getCompanyId();
        if (sessionCompanyId != null) {
            dto.setCompanyId(sessionCompanyId);
        }

        return productService.update(id, dto);
    }

    @DeleteMapping("/api/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {

        ProductDTO existing = productService.findById(id);
        checkOwnership(existing.getCompanyId(), id);

        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private void checkOwnership(Long resourceCompanyId, Long resourceId) {
        Long sessionCompanyId = demoContext.getCompanyId();

        if (sessionCompanyId != null && !sessionCompanyId.equals(resourceCompanyId)) {
            throw new ResourceNotFoundException("Producto no encontrado con id " + resourceId);
        }
    }
}