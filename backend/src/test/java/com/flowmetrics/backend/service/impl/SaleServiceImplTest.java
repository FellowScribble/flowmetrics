package com.flowmetrics.backend.service.impl;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.flowmetrics.backend.dto.CreateSaleDTO;
import com.flowmetrics.backend.dto.CreateSaleItemDTO;
import com.flowmetrics.backend.entity.Company;
import com.flowmetrics.backend.entity.Customer;
import com.flowmetrics.backend.entity.Product;
import com.flowmetrics.backend.entity.Sale;
import com.flowmetrics.backend.exception.InsufficientStockException;
import com.flowmetrics.backend.exception.ResourceNotFoundException;
import com.flowmetrics.backend.repository.CompanyRepository;
import com.flowmetrics.backend.repository.CustomerRepository;
import com.flowmetrics.backend.repository.ProductRepository;
import com.flowmetrics.backend.repository.SaleRepository;
import com.flowmetrics.backend.service.ActivityService;

@ExtendWith(MockitoExtension.class)
class SaleServiceImplTest {

    @Mock private SaleRepository saleRepository;
    @Mock private CompanyRepository companyRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private ProductRepository productRepository;
    @Mock private ActivityService activityService;

    @InjectMocks private SaleServiceImpl saleService;

    @Test
    void create_clienteDeOtraEmpresa_lanzaNotFound() {
        Company company = company(1L);
        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));

        Customer customer = new Customer();
        customer.setId(50L);
        customer.setCompany(company(2L));
        when(customerRepository.findById(50L)).thenReturn(Optional.of(customer));

        CreateSaleDTO dto = new CreateSaleDTO();
        dto.setCompanyId(1L);
        dto.setCustomerId(50L);

        assertThrows(ResourceNotFoundException.class, () -> saleService.create(dto));
        verify(saleRepository, never()).save(any());
    }

    @Test
    void create_productoDeOtraEmpresa_lanzaNotFound() {
        Company company = company(1L);
        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));

        Customer customer = new Customer();
        customer.setId(50L);
        customer.setCompany(company);
        when(customerRepository.findById(50L)).thenReturn(Optional.of(customer));

        Product product = new Product();
        product.setId(70L);
        product.setCompany(company(2L));
        when(productRepository.findById(70L)).thenReturn(Optional.of(product));

        CreateSaleItemDTO item = new CreateSaleItemDTO();
        item.setProductId(70L);
        item.setQuantity(1);

        CreateSaleDTO dto = new CreateSaleDTO();
        dto.setCompanyId(1L);
        dto.setCustomerId(50L);
        dto.setItems(List.of(item));

        assertThrows(ResourceNotFoundException.class, () -> saleService.create(dto));
        verify(productRepository, never()).save(any());
        verify(saleRepository, never()).save(any());
    }

    @Test
    void create_mismaEmpresa_guardaVentaYDescuentaStock() {
        Company company = company(1L);
        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));

        Customer customer = new Customer();
        customer.setId(50L);
        customer.setName("Juan Pérez");
        customer.setCompany(company);
        when(customerRepository.findById(50L)).thenReturn(Optional.of(customer));

        Product product = new Product();
        product.setId(70L);
        product.setName("Café Premium");
        product.setCompany(company);
        product.setSalePrice(new BigDecimal("5.00"));
        product.setStock(10);
        when(productRepository.findById(70L)).thenReturn(Optional.of(product));

        when(saleRepository.save(any(Sale.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CreateSaleItemDTO item = new CreateSaleItemDTO();
        item.setProductId(70L);
        item.setQuantity(2);

        CreateSaleDTO dto = new CreateSaleDTO();
        dto.setCompanyId(1L);
        dto.setCustomerId(50L);
        dto.setPaymentMethod("CARD");
        dto.setPaymentStatus("PAID");
        dto.setStatus("COMPLETED");
        dto.setItems(List.of(item));

        var result = saleService.create(dto);

        assertNotNull(result);
        assertEquals(8, product.getStock());
        assertEquals(new BigDecimal("10.00"), result.getTotal());
        verify(saleRepository).save(any(Sale.class));
    }

    @Test
    void create_stockInsuficiente_lanzaExcepcionYNoModificaStock() {
        Company company = company(1L);
        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));

        Customer customer = new Customer();
        customer.setId(50L);
        customer.setCompany(company);
        when(customerRepository.findById(50L)).thenReturn(Optional.of(customer));

        Product product = new Product();
        product.setId(70L);
        product.setName("Café Premium");
        product.setCompany(company);
        product.setSalePrice(new BigDecimal("5.00"));
        product.setStock(1);
        when(productRepository.findById(70L)).thenReturn(Optional.of(product));

        CreateSaleItemDTO item = new CreateSaleItemDTO();
        item.setProductId(70L);
        item.setQuantity(2);

        CreateSaleDTO dto = new CreateSaleDTO();
        dto.setCompanyId(1L);
        dto.setCustomerId(50L);
        dto.setItems(List.of(item));

        assertThrows(InsufficientStockException.class, () -> saleService.create(dto));
        verify(productRepository, never()).save(any());
        verify(saleRepository, never()).save(any());
        assertEquals(1, product.getStock());
    }

    private static Company company(Long id) {
        Company company = new Company();
        company.setId(id);
        return company;
    }
}
