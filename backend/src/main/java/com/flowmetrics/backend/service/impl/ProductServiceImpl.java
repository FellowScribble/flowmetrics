package com.flowmetrics.backend.service.impl;

import java.util.List;


import org.springframework.stereotype.Service;

import com.flowmetrics.backend.repository.ProductRepository;
import com.flowmetrics.backend.repository.CompanyRepository;
import com.flowmetrics.backend.repository.CategoryRepository;
import com.flowmetrics.backend.service.ProductService;
import com.flowmetrics.backend.dto.ProductDTO;
import com.flowmetrics.backend.dto.CreateProductDTO;
import com.flowmetrics.backend.mapper.ProductMapper;
import com.flowmetrics.backend.entity.Product;
import com.flowmetrics.backend.entity.Company;
import com.flowmetrics.backend.entity.Category;
import com.flowmetrics.backend.exception.ResourceNotFoundException;
import com.flowmetrics.backend.service.ActivityService;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CompanyRepository companyRepository;
    private final CategoryRepository categoryRepository;
    private final ActivityService activityService;

    public ProductServiceImpl(ProductRepository productRepository,
					            CompanyRepository companyRepository,
					            CategoryRepository categoryRepository,
					            ActivityService activityService) {
	this.productRepository = productRepository;
	this.companyRepository = companyRepository;
	this.categoryRepository = categoryRepository;
	this.activityService = activityService;
	}

    @Override
    public List<ProductDTO> findAll() {
        return productRepository.findAll()
                .stream()
                .map(ProductMapper::toDTO)
                .toList();
    }

    @Override
    public List<ProductDTO> findByCompany(Long companyId) {
        return productRepository.findByCompanyId(companyId)
                .stream()
                .map(ProductMapper::toDTO)
                .toList();
    }

    @Override
    public ProductDTO findById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id " + id));

        return ProductMapper.toDTO(product);
    }

    @Override
    public ProductDTO create(CreateProductDTO dto) {

        Company company = companyRepository.findById(dto.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Empresa no encontrada con id " + dto.getCompanyId()));

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con id " + dto.getCategoryId()));

        if (!category.getCompany().getId().equals(company.getId())) {
            throw new ResourceNotFoundException("Categoría no encontrada con id " + dto.getCategoryId());
        }

        Product product = new Product();
        product.setCompany(company);
        product.setCategory(category);
        product.setName(dto.getName());
        product.setSalePrice(dto.getSalePrice());
        product.setCostPrice(dto.getCostPrice());
        product.setStock(dto.getStock());
        product.setMinimumStock(dto.getMinimumStock());
        product.setIsActive(dto.getIsActive());

        Product savedProduct = productRepository.save(product);
        
        activityService.log(
                company.getId(),
                "Nuevo producto añadido",
                savedProduct.getName(),
                "PRODUCT_CREATED",
                "PRODUCT",
                savedProduct.getId()
        );

        return ProductMapper.toDTO(savedProduct);
    }

    @Override
    public ProductDTO update(Long id, CreateProductDTO dto) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id " + id));

        Company company = companyRepository.findById(dto.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Empresa no encontrada con id " + dto.getCompanyId()));

        Category category = categoryRepository.findById(dto.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada con id " + dto.getCategoryId()));

        if (!category.getCompany().getId().equals(company.getId())) {
            throw new ResourceNotFoundException("Categoría no encontrada con id " + dto.getCategoryId());
        }

        product.setCompany(company);
        product.setCategory(category);
        product.setName(dto.getName());
        product.setSalePrice(dto.getSalePrice());
        product.setCostPrice(dto.getCostPrice());
        product.setStock(dto.getStock());
        product.setMinimumStock(dto.getMinimumStock());
        product.setIsActive(dto.getIsActive());

        Product updatedProduct = productRepository.save(product);

        return ProductMapper.toDTO(updatedProduct);
    }

    @Override
    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id " + id));

        productRepository.delete(product);
    }
}