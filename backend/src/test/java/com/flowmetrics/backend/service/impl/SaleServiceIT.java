package com.flowmetrics.backend.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.math.BigDecimal;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.flowmetrics.backend.AbstractIntegrationTest;
import com.flowmetrics.backend.dto.CreateSaleDTO;
import com.flowmetrics.backend.dto.CreateSaleItemDTO;
import com.flowmetrics.backend.entity.Category;
import com.flowmetrics.backend.entity.Company;
import com.flowmetrics.backend.entity.Customer;
import com.flowmetrics.backend.entity.Product;
import com.flowmetrics.backend.exception.InsufficientStockException;
import com.flowmetrics.backend.exception.ResourceNotFoundException;
import com.flowmetrics.backend.repository.CategoryRepository;
import com.flowmetrics.backend.repository.CompanyRepository;
import com.flowmetrics.backend.repository.CustomerRepository;
import com.flowmetrics.backend.repository.ProductRepository;
import com.flowmetrics.backend.service.SaleService;

class SaleServiceIT extends AbstractIntegrationTest {

    @Autowired private SaleService saleService;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private CustomerRepository customerRepository;

    private Company company;
    private Product product;
    private Customer customer;

    @BeforeEach
    void setUp() {
        company = saveCompany("Empresa A");
        Category category = saveCategory(company, "Bebidas");
        product = saveProduct(company, category, "Café", new BigDecimal("5.00"), 10);
        customer = saveCustomer(company, "Cliente A");
    }

    @Test
    void crearVenta_calculaTotalYDescuentaStock() {
        CreateSaleDTO dto = saleDto(company.getId(), customer.getId(),
                List.of(item(product.getId(), 2)));

        var result = saleService.create(dto);

        assertThat(result.getTotal()).isEqualByComparingTo("10.00");
        assertThat(productRepository.findById(product.getId()).orElseThrow().getStock()).isEqualTo(8);
    }

    @Test
    void crearVenta_conStockInsuficiente_lanzaExcepcion() {
        CreateSaleDTO dto = saleDto(company.getId(), customer.getId(),
                List.of(item(product.getId(), 11)));

        assertThrows(InsufficientStockException.class, () -> saleService.create(dto));
    }

    @Test
    void crearVenta_conProductoDeOtraEmpresa_lanzaNotFound() {
        Company otra = saveCompany("Empresa B");
        Category catB = saveCategory(otra, "B");
        Product productoAjeno = saveProduct(otra, catB, "Producto B", new BigDecimal("3.00"), 5);

        CreateSaleDTO dto = saleDto(company.getId(), customer.getId(),
                List.of(item(productoAjeno.getId(), 1)));

        assertThrows(ResourceNotFoundException.class, () -> saleService.create(dto));
    }

    @Test
    void crearVenta_conClienteDeOtraEmpresa_lanzaNotFound() {
        Company otra = saveCompany("Empresa B");
        Customer clienteAjeno = saveCustomer(otra, "Cliente B");

        CreateSaleDTO dto = saleDto(company.getId(), clienteAjeno.getId(),
                List.of(item(product.getId(), 1)));

        assertThrows(ResourceNotFoundException.class, () -> saleService.create(dto));
    }

    // --- helpers ---

    private static CreateSaleItemDTO item(Long productId, int quantity) {
        CreateSaleItemDTO i = new CreateSaleItemDTO();
        i.setProductId(productId);
        i.setQuantity(quantity);
        return i;
    }

    private static CreateSaleDTO saleDto(Long companyId, Long customerId, List<CreateSaleItemDTO> items) {
        CreateSaleDTO dto = new CreateSaleDTO();
        dto.setCompanyId(companyId);
        dto.setCustomerId(customerId);
        dto.setPaymentMethod("CARD");
        dto.setPaymentStatus("PAID");
        dto.setStatus("COMPLETED");
        dto.setItems(items);
        return dto;
    }

    private Company saveCompany(String name) {
        Company c = new Company();
        c.setName(name);
        c.setIndustry("Tecnología");
        c.setCountry("España");
        c.setCurrency("EUR");
        c.setIsTemplate(false);
        return companyRepository.save(c);
    }

    private Category saveCategory(Company company, String name) {
        Category c = new Category();
        c.setCompany(company);
        c.setName(name);
        return categoryRepository.save(c);
    }

    private Product saveProduct(Company company, Category category, String name,
                                BigDecimal price, int stock) {
        Product p = new Product();
        p.setCompany(company);
        p.setCategory(category);
        p.setName(name);
        p.setSalePrice(price);
        p.setCostPrice(new BigDecimal("1.00"));
        p.setStock(stock);
        p.setMinimumStock(1);
        p.setIsActive(true);
        return productRepository.save(p);
    }

    private Customer saveCustomer(Company company, String name) {
        Customer c = new Customer();
        c.setCompany(company);
        c.setName(name);
        return customerRepository.save(c);
    }
}
