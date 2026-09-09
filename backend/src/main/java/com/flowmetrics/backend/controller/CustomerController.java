package com.flowmetrics.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import com.flowmetrics.backend.dto.CustomerDTO;
import com.flowmetrics.backend.dto.CreateCustomerDTO;
import com.flowmetrics.backend.service.CustomerService;

@RestController
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @GetMapping("/api/customers")
    public List<CustomerDTO> getCustomers(@RequestParam(required = false) Long companyId) {
        if (companyId != null) {
            return customerService.findByCompany(companyId);
        }
        return customerService.findAll();
    }

    @GetMapping("/api/customers/{id}")
    public CustomerDTO getCustomerById(@PathVariable Long id) {
        return customerService.findById(id);
    }

    @PostMapping("/api/customers")
    public CustomerDTO createCustomer(@RequestBody CreateCustomerDTO dto) {
        return customerService.create(dto);
    }

    @PutMapping("/api/customers/{id}")
    public CustomerDTO updateCustomer(@PathVariable Long id, @RequestBody CreateCustomerDTO dto) {
        return customerService.update(id, dto);
    }

    @DeleteMapping("/api/customers/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        customerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}