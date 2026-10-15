package com.flowmetrics.backend.service;

import java.util.List;

import com.flowmetrics.backend.dto.ProductDTO;
import com.flowmetrics.backend.dto.CreateProductDTO;

public interface ProductService {

    List<ProductDTO> findAll();

    List<ProductDTO> findByCompany(Long companyId);

    ProductDTO findById(Long id);

    ProductDTO create(CreateProductDTO dto);

    ProductDTO update(Long id, CreateProductDTO dto);

    void delete(Long id);
}