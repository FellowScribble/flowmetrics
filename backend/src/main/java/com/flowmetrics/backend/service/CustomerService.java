package com.flowmetrics.backend.service;

import java.util.List;

import com.flowmetrics.backend.dto.CustomerDTO;
import com.flowmetrics.backend.dto.CreateCustomerDTO;

public interface CustomerService {

    List<CustomerDTO> findAll();

    List<CustomerDTO> findByCompany(Long companyId);

    CustomerDTO findById(Long id);

    CustomerDTO create(CreateCustomerDTO dto);

    CustomerDTO update(Long id, CreateCustomerDTO dto);

    void delete(Long id);
}