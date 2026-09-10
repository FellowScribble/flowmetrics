package com.flowmetrics.backend.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flowmetrics.backend.entity.*;
import com.flowmetrics.backend.repository.*;
import com.flowmetrics.backend.service.DemoCleanupService;

@Service
public class DemoCleanupServiceImpl implements DemoCleanupService {

    private final DemoSessionRepository demoSessionRepository;
    private final SaleRepository saleRepository;
    private final ActivityRepository activityRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;
    private final CategoryRepository categoryRepository;
    private final CompanyRepository companyRepository;

    public DemoCleanupServiceImpl(DemoSessionRepository demoSessionRepository,
                                   SaleRepository saleRepository,
                                   ActivityRepository activityRepository,
                                   ProductRepository productRepository,
                                   CustomerRepository customerRepository,
                                   CategoryRepository categoryRepository,
                                   CompanyRepository companyRepository) {
        this.demoSessionRepository = demoSessionRepository;
        this.saleRepository = saleRepository;
        this.activityRepository = activityRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
        this.categoryRepository = categoryRepository;
        this.companyRepository = companyRepository;
    }

    // Cada hora (3.600.000 ms). Lo bajaremos temporalmente para probar.
    @Scheduled(fixedRate = 3600000)
    @Override
    @Transactional
    public void cleanupExpiredSessions() {

        List<DemoSession> expiredSessions =
                demoSessionRepository.findByIsActiveTrueAndExpiresAtBefore(LocalDateTime.now());

        for (DemoSession session : expiredSessions) {

            Long companyId = session.getCompany().getId();

            purgeCompanyData(companyId);

            demoSessionRepository.delete(session);
            companyRepository.deleteById(companyId);
        }

        if (!expiredSessions.isEmpty()) {
            System.out.println("[DemoCleanup] Sesiones eliminadas: " + expiredSessions.size());
        }
    }

    private void purgeCompanyData(Long companyId) {

        // 1. Ventas (JPA cascadea sus sale_items automáticamente por la relación en Sale)
        List<Sale> sales = saleRepository.findByCompanyId(companyId);
        saleRepository.deleteAll(sales);

        // 2. Actividad
        List<Activity> activities = activityRepository.findByCompanyId(companyId);
        activityRepository.deleteAll(activities);

        // 3. Productos (dependen de categorías, así que van antes)
        List<Product> products = productRepository.findByCompanyId(companyId);
        productRepository.deleteAll(products);

        // 4. Clientes
        List<Customer> customers = customerRepository.findByCompanyId(companyId);
        customerRepository.deleteAll(customers);

        // 5. Categorías
        List<Category> categories = categoryRepository.findByCompanyId(companyId);
        categoryRepository.deleteAll(categories);
    }
}