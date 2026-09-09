package com.flowmetrics.backend.service;

import java.util.List;

import com.flowmetrics.backend.dto.SaleDTO;
import com.flowmetrics.backend.dto.CreateSaleDTO;

public interface SaleService {

    List<SaleDTO> findAll();

    List<SaleDTO> findByCompany(Long companyId);

    SaleDTO findById(Long id);

    SaleDTO create(CreateSaleDTO dto);

    SaleDTO update(Long id, CreateSaleDTO dto);

    void delete(Long id);
}