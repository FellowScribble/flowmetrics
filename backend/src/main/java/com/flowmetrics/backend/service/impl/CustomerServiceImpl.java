package com.flowmetrics.backend.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.flowmetrics.backend.repository.CustomerRepository;
import com.flowmetrics.backend.repository.CompanyRepository;
import com.flowmetrics.backend.service.CustomerService;
import com.flowmetrics.backend.dto.CustomerDTO;
import com.flowmetrics.backend.dto.CreateCustomerDTO;
import com.flowmetrics.backend.mapper.CustomerMapper;
import com.flowmetrics.backend.entity.Customer;
import com.flowmetrics.backend.entity.Company;
import com.flowmetrics.backend.exception.ResourceNotFoundException;
import com.flowmetrics.backend.service.ActivityService;

@Service
public class CustomerServiceImpl implements CustomerService {

    private final CustomerRepository customerRepository;
    private final CompanyRepository companyRepository;
    private final ActivityService activityService;

    public CustomerServiceImpl(CustomerRepository customerRepository,CompanyRepository companyRepository,ActivityService activityService) {
    	this.customerRepository = customerRepository;
    	this.companyRepository = companyRepository;
    	this.activityService = activityService;
    }

    @Override
    public List<CustomerDTO> findAll() {
        return customerRepository.findAll()
                .stream()
                .map(CustomerMapper::toDTO)
                .toList();
    }

    @Override
    public List<CustomerDTO> findByCompany(Long companyId) {
        return customerRepository.findByCompanyId(companyId)
                .stream()
                .map(CustomerMapper::toDTO)
                .toList();
    }

    @Override
    public CustomerDTO findById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id " + id));

        return CustomerMapper.toDTO(customer);
    }

    @Override
    public CustomerDTO create(CreateCustomerDTO dto) {

        Company company = companyRepository.findById(dto.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Empresa no encontrada con id " + dto.getCompanyId()));

        Customer customer = new Customer();
        customer.setCompany(company);
        customer.setName(dto.getName());
        customer.setEmail(dto.getEmail());
        customer.setPhone(dto.getPhone());
        customer.setCity(dto.getCity());
        customer.setCountry(dto.getCountry());
        customer.setIsActive(dto.getIsActive());

        Customer savedCustomer = customerRepository.save(customer);
        
        activityService.log(
                company.getId(),
                "Nuevo cliente registrado",
                savedCustomer.getName(),
                "CUSTOMER_CREATED",
                "CUSTOMER",
                savedCustomer.getId()
        );

        return CustomerMapper.toDTO(savedCustomer);
    }

    @Override
    public CustomerDTO update(Long id, CreateCustomerDTO dto) {

        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id " + id));

        Company company = companyRepository.findById(dto.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Empresa no encontrada con id " + dto.getCompanyId()));

        customer.setCompany(company);
        customer.setName(dto.getName());
        customer.setEmail(dto.getEmail());
        customer.setPhone(dto.getPhone());
        customer.setCity(dto.getCity());
        customer.setCountry(dto.getCountry());
        customer.setIsActive(dto.getIsActive());

        Customer updatedCustomer = customerRepository.save(customer);

        return CustomerMapper.toDTO(updatedCustomer);
    }
    
    @Override
    public void delete(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id " + id));

        customerRepository.delete(customer);
    }
}