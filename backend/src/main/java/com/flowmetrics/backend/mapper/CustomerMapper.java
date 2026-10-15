package com.flowmetrics.backend.mapper;

import com.flowmetrics.backend.dto.CustomerDTO;
import com.flowmetrics.backend.entity.Customer;

public class CustomerMapper {

    public static CustomerDTO toDTO(Customer customer) {
        CustomerDTO dto = new CustomerDTO();
        dto.setId(customer.getId());
        dto.setCompanyId(customer.getCompany().getId());
        dto.setName(customer.getName());
        dto.setEmail(customer.getEmail());
        dto.setPhone(customer.getPhone());
        dto.setCity(customer.getCity());
        dto.setCountry(customer.getCountry());
        dto.setIsActive(customer.getIsActive());
        dto.setCreatedAt(customer.getCreatedAt());
        dto.setUpdatedAt(customer.getUpdatedAt());
        return dto;
    }
}