package com.flowmetrics.backend.service.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flowmetrics.backend.entity.*;
import com.flowmetrics.backend.repository.*;
import com.flowmetrics.backend.service.CompanyCloningService;

@Service
public class CompanyCloningServiceImpl implements CompanyCloningService {

    private final CompanyRepository companyRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final SaleRepository saleRepository;

    public CompanyCloningServiceImpl(CompanyRepository companyRepository,
                                      CategoryRepository categoryRepository,
                                      ProductRepository productRepository,
                                      CustomerRepository customerRepository,
                                      SaleRepository saleRepository) {
        this.companyRepository = companyRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.saleRepository = saleRepository;
    }

    @Override
    @Transactional
    public Company cloneCompany(Company template) {

        // 1. Clonar la empresa
        Company newCompany = new Company();
        newCompany.setName(template.getName());
        newCompany.setIndustry(template.getIndustry());
        newCompany.setCountry(template.getCountry());
        newCompany.setCurrency(template.getCurrency());
        newCompany.setIsTemplate(false);
        newCompany = companyRepository.save(newCompany);

        // 2. Clonar categorías, guardando el mapeo id_antiguo -> categoría_nueva
        Map<Long, Category> categoryMap = new HashMap<>();
        List<Category> templateCategories = categoryRepository.findByCompanyId(template.getId());

        for (Category oldCategory : templateCategories) {
            Category newCategory = new Category();
            newCategory.setCompany(newCompany);
            newCategory.setName(oldCategory.getName());
            newCategory.setDescription(oldCategory.getDescription());
            newCategory = categoryRepository.save(newCategory);
            categoryMap.put(oldCategory.getId(), newCategory);
        }

        // 3. Clonar productos, usando el mapeo de categorías
        Map<Long, Product> productMap = new HashMap<>();
        List<Product> templateProducts = productRepository.findByCompanyId(template.getId());

        for (Product oldProduct : templateProducts) {
            Product newProduct = new Product();
            newProduct.setCompany(newCompany);
            newProduct.setCategory(categoryMap.get(oldProduct.getCategory().getId()));
            newProduct.setName(oldProduct.getName());
            newProduct.setSalePrice(oldProduct.getSalePrice());
            newProduct.setCostPrice(oldProduct.getCostPrice());
            newProduct.setStock(oldProduct.getStock());
            newProduct.setMinimumStock(oldProduct.getMinimumStock());
            newProduct.setIsActive(oldProduct.getIsActive());
            newProduct = productRepository.save(newProduct);
            productMap.put(oldProduct.getId(), newProduct);
        }

        // 4. Clonar clientes
        Map<Long, Customer> customerMap = new HashMap<>();
        List<Customer> templateCustomers = customerRepository.findByCompanyId(template.getId());

        for (Customer oldCustomer : templateCustomers) {
            Customer newCustomer = new Customer();
            newCustomer.setCompany(newCompany);
            newCustomer.setName(oldCustomer.getName());
            newCustomer.setEmail(oldCustomer.getEmail());
            newCustomer.setPhone(oldCustomer.getPhone());
            newCustomer.setCity(oldCustomer.getCity());
            newCustomer.setCountry(oldCustomer.getCountry());
            newCustomer.setIsActive(oldCustomer.getIsActive());
            newCustomer = customerRepository.save(newCustomer);
            customerMap.put(oldCustomer.getId(), newCustomer);
        }

        // 5. Clonar ventas + sus líneas, usando ambos mapeos
        List<Sale> templateSales = saleRepository.findByCompanyId(template.getId());

        for (Sale oldSale : templateSales) {
            Sale newSale = new Sale();
            newSale.setCompany(newCompany);
            newSale.setCustomer(customerMap.get(oldSale.getCustomer().getId()));
            newSale.setSaleDate(oldSale.getSaleDate());
            newSale.setTotal(oldSale.getTotal());
            newSale.setPaymentMethod(oldSale.getPaymentMethod());
            newSale.setPaymentStatus(oldSale.getPaymentStatus());
            newSale.setStatus(oldSale.getStatus());
            newSale.setNotes(oldSale.getNotes());

            for (SaleItem oldItem : oldSale.getItems()) {
                SaleItem newItem = new SaleItem();
                newItem.setSale(newSale);
                newItem.setProduct(productMap.get(oldItem.getProduct().getId()));
                newItem.setQuantity(oldItem.getQuantity());
                newItem.setUnitPrice(oldItem.getUnitPrice());
                newItem.setSubtotal(oldItem.getSubtotal());
                newSale.getItems().add(newItem);
            }

            saleRepository.save(newSale);
        }

        return newCompany;
    }
}