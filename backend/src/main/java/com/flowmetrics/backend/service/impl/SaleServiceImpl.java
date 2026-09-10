package com.flowmetrics.backend.service.impl;

import java.math.BigDecimal;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flowmetrics.backend.repository.SaleRepository;
import com.flowmetrics.backend.repository.CompanyRepository;
import com.flowmetrics.backend.repository.CustomerRepository;
import com.flowmetrics.backend.repository.ProductRepository;
import com.flowmetrics.backend.service.SaleService;
import com.flowmetrics.backend.dto.SaleDTO;
import com.flowmetrics.backend.dto.CreateSaleDTO;
import com.flowmetrics.backend.dto.CreateSaleItemDTO;
import com.flowmetrics.backend.mapper.SaleMapper;
import com.flowmetrics.backend.entity.Sale;
import com.flowmetrics.backend.entity.SaleItem;
import com.flowmetrics.backend.entity.Company;
import com.flowmetrics.backend.entity.Customer;
import com.flowmetrics.backend.entity.Product;
import com.flowmetrics.backend.exception.ResourceNotFoundException;
import com.flowmetrics.backend.exception.InsufficientStockException;
import com.flowmetrics.backend.service.ActivityService;

@Service
public class SaleServiceImpl implements SaleService {

	private final SaleRepository saleRepository;
	private final CompanyRepository companyRepository;
	private final CustomerRepository customerRepository;
	private final ProductRepository productRepository;
	private final ActivityService activityService;

	public SaleServiceImpl(SaleRepository saleRepository,
	                        CompanyRepository companyRepository,
	                        CustomerRepository customerRepository,
	                        ProductRepository productRepository,
	                        ActivityService activityService) {
	    this.saleRepository = saleRepository;
	    this.companyRepository = companyRepository;
	    this.customerRepository = customerRepository;
	    this.productRepository = productRepository;
	    this.activityService = activityService;
	}

    @Override
    @Transactional(readOnly = true)
    public List<SaleDTO> findAll() {
        return saleRepository.findAll()
                .stream()
                .map(SaleMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SaleDTO> findByCompany(Long companyId) {
        return saleRepository.findByCompanyId(companyId)
                .stream()
                .map(SaleMapper::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SaleDTO findById(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada con id " + id));

        return SaleMapper.toDTO(sale);
    }

    @Override
    @Transactional
    public SaleDTO create(CreateSaleDTO dto) {

        Company company = companyRepository.findById(dto.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Empresa no encontrada con id " + dto.getCompanyId()));

        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id " + dto.getCustomerId()));

        Sale sale = new Sale();
        sale.setCompany(company);
        sale.setCustomer(customer);
        sale.setPaymentMethod(dto.getPaymentMethod());
        sale.setPaymentStatus(dto.getPaymentStatus());
        sale.setStatus(dto.getStatus());
        sale.setNotes(dto.getNotes());

        List<SaleItem> items = buildItemsAndDeductStock(dto.getItems(), sale);
        sale.setItems(items);
        sale.setTotal(calculateTotal(items));

        Sale savedSale = saleRepository.save(sale);
        
        activityService.log(
                company.getId(),
                "Nueva venta registrada",
                customer.getName() + " · " + savedSale.getTotal() + " " + company.getCurrency(),
                "SALE_CREATED",
                "SALE",
                savedSale.getId()
        );

        return SaleMapper.toDTO(savedSale);
    }

    @Override
    @Transactional
    public SaleDTO update(Long id, CreateSaleDTO dto) {

        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada con id " + id));

        Company company = companyRepository.findById(dto.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Empresa no encontrada con id " + dto.getCompanyId()));

        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id " + dto.getCustomerId()));

        // Devolvemos al stock las cantidades de los items antiguos, antes de aplicar los nuevos
        restoreStock(sale.getItems());

        sale.setCompany(company);
        sale.setCustomer(customer);
        sale.setPaymentMethod(dto.getPaymentMethod());
        sale.setPaymentStatus(dto.getPaymentStatus());
        sale.setStatus(dto.getStatus());
        sale.setNotes(dto.getNotes());

        sale.getItems().clear();

        List<SaleItem> newItems = buildItemsAndDeductStock(dto.getItems(), sale);
        sale.getItems().addAll(newItems);
        sale.setTotal(calculateTotal(newItems));

        Sale updatedSale = saleRepository.save(sale);

        return SaleMapper.toDTO(updatedSale);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Sale sale = saleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada con id " + id));

        // Al borrar la venta, devolvemos el stock reservado
        restoreStock(sale.getItems());

        saleRepository.delete(sale);
    }

    // --- Métodos de apoyo ---

    private List<SaleItem> buildItemsAndDeductStock(List<CreateSaleItemDTO> itemDTOs, Sale sale) {

        List<SaleItem> items = new ArrayList<>();

        for (CreateSaleItemDTO itemDTO : itemDTOs) {

            Product product = productRepository.findById(itemDTO.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id " + itemDTO.getProductId()));

            if (product.getStock() < itemDTO.getQuantity()) {
                throw new InsufficientStockException(
                        "Stock insuficiente para el producto '" + product.getName() +
                        "' (disponible: " + product.getStock() + ", solicitado: " + itemDTO.getQuantity() + ")");
            }

            product.setStock(product.getStock() - itemDTO.getQuantity());
            productRepository.save(product);

            SaleItem item = new SaleItem();
            item.setSale(sale);
            item.setProduct(product);
            item.setQuantity(itemDTO.getQuantity());
            item.setUnitPrice(product.getSalePrice());
            item.setSubtotal(product.getSalePrice().multiply(BigDecimal.valueOf(itemDTO.getQuantity())));

            items.add(item);
        }

        return items;
    }

    private void restoreStock(List<SaleItem> items) {
        for (SaleItem item : items) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }
    }

    private BigDecimal calculateTotal(List<SaleItem> items) {
        return items.stream()
                .map(SaleItem::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}