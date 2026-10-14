package com.flowmetrics.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import com.flowmetrics.backend.dto.CustomerDTO;
import com.flowmetrics.backend.dto.CreateCustomerDTO;
import com.flowmetrics.backend.service.CustomerService;
import com.flowmetrics.backend.context.SessionGuard;

@RestController
public class CustomerController {

    private final CustomerService customerService;
    private final SessionGuard sessionGuard;

    public CustomerController(CustomerService customerService, SessionGuard sessionGuard) {
        this.customerService = customerService;
        this.sessionGuard = sessionGuard;
    }

    @GetMapping("/api/customers")
    public List<CustomerDTO> getCustomers() {
        return customerService.findByCompany(sessionGuard.requireCompanyId());
    }

    @GetMapping("/api/customers/{id}")
    public CustomerDTO getCustomerById(@PathVariable Long id) {
        CustomerDTO customer = customerService.findById(id);
        sessionGuard.requireOwnership(customer.getCompanyId(), "Cliente", id);
        return customer;
    }

    @PostMapping("/api/customers")
    public CustomerDTO createCustomer(@RequestBody CreateCustomerDTO dto) {
        dto.setCompanyId(sessionGuard.requireCompanyId());
        return customerService.create(dto);
    }

    @PutMapping("/api/customers/{id}")
    public CustomerDTO updateCustomer(@PathVariable Long id, @RequestBody CreateCustomerDTO dto) {
        CustomerDTO existing = customerService.findById(id);
        sessionGuard.requireOwnership(existing.getCompanyId(), "Cliente", id);

        dto.setCompanyId(sessionGuard.requireCompanyId());
        return customerService.update(id, dto);
    }

    @DeleteMapping("/api/customers/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        CustomerDTO existing = customerService.findById(id);
        sessionGuard.requireOwnership(existing.getCompanyId(), "Cliente", id);

        customerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
