package com.flowmetrics.backend.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import com.flowmetrics.backend.dto.CustomerDTO;
import com.flowmetrics.backend.dto.CreateCustomerDTO;
import com.flowmetrics.backend.service.CustomerService;
import com.flowmetrics.backend.context.DemoContext;
import com.flowmetrics.backend.exception.ResourceNotFoundException;

@RestController
public class CustomerController {

    private final CustomerService customerService;
    private final DemoContext demoContext;

    public CustomerController(CustomerService customerService, DemoContext demoContext) {
        this.customerService = customerService;
        this.demoContext = demoContext;
    }

    @GetMapping("/api/customers")
    public List<CustomerDTO> getCustomers(@RequestParam(required = false) Long companyId) {

        Long resolvedCompanyId = demoContext.getCompanyId();

        if (resolvedCompanyId == null) {
            resolvedCompanyId = companyId;
        }

        if (resolvedCompanyId != null) {
            return customerService.findByCompany(resolvedCompanyId);
        }

        return customerService.findAll();
    }

    @GetMapping("/api/customers/{id}")
    public CustomerDTO getCustomerById(@PathVariable Long id) {
        CustomerDTO customer = customerService.findById(id);
        checkOwnership(customer.getCompanyId(), id);
        return customer;
    }

    @PostMapping("/api/customers")
    public CustomerDTO createCustomer(@RequestBody CreateCustomerDTO dto) {

        Long sessionCompanyId = demoContext.getCompanyId();
        if (sessionCompanyId != null) {
            dto.setCompanyId(sessionCompanyId);
        }

        return customerService.create(dto);
    }

    @PutMapping("/api/customers/{id}")
    public CustomerDTO updateCustomer(@PathVariable Long id, @RequestBody CreateCustomerDTO dto) {

        CustomerDTO existing = customerService.findById(id);
        checkOwnership(existing.getCompanyId(), id);

        Long sessionCompanyId = demoContext.getCompanyId();
        if (sessionCompanyId != null) {
            dto.setCompanyId(sessionCompanyId);
        }

        return customerService.update(id, dto);
    }

    @DeleteMapping("/api/customers/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {

        CustomerDTO existing = customerService.findById(id);
        checkOwnership(existing.getCompanyId(), id);

        customerService.delete(id);
        return ResponseEntity.noContent().build();
    }

    private void checkOwnership(Long resourceCompanyId, Long resourceId) {
        Long sessionCompanyId = demoContext.getCompanyId();

        if (sessionCompanyId != null && !sessionCompanyId.equals(resourceCompanyId)) {
            throw new ResourceNotFoundException("Cliente no encontrado con id " + resourceId);
        }
    }
}