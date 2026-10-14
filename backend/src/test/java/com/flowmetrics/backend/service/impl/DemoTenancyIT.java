package com.flowmetrics.backend.service.impl;

import static org.assertj.core.api.Assertions.assertThat;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import com.flowmetrics.backend.AbstractIntegrationTest;
import com.flowmetrics.backend.entity.Category;
import com.flowmetrics.backend.entity.Company;
import com.flowmetrics.backend.entity.Customer;
import com.flowmetrics.backend.entity.DemoSession;
import com.flowmetrics.backend.entity.Product;
import com.flowmetrics.backend.repository.CategoryRepository;
import com.flowmetrics.backend.repository.CompanyRepository;
import com.flowmetrics.backend.repository.CustomerRepository;
import com.flowmetrics.backend.repository.DemoSessionRepository;
import com.flowmetrics.backend.repository.ProductRepository;
import com.flowmetrics.backend.service.DemoCleanupService;
import com.flowmetrics.backend.service.DemoSessionService;

class DemoTenancyIT extends AbstractIntegrationTest {

    @Autowired private DemoSessionService demoSessionService;
    @Autowired private DemoCleanupService demoCleanupService;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private DemoSessionRepository demoSessionRepository;

    private Company template;

    @BeforeEach
    void setUp() {
        template = new Company();
        template.setName("Plantilla Test");
        template.setIndustry("Tecnología");
        template.setCountry("España");
        template.setCurrency("EUR");
        template.setIsTemplate(true);
        template = companyRepository.save(template);

        Category category = new Category();
        category.setCompany(template);
        category.setName("Categoría plantilla");
        category = categoryRepository.save(category);

        Product product = new Product();
        product.setCompany(template);
        product.setCategory(category);
        product.setName("Producto plantilla");
        product.setSalePrice(new BigDecimal("9.99"));
        product.setCostPrice(new BigDecimal("4.00"));
        product.setStock(50);
        product.setMinimumStock(5);
        product.setIsActive(true);
        productRepository.save(product);

        Customer customer = new Customer();
        customer.setCompany(template);
        customer.setName("Cliente plantilla");
        customerRepository.save(customer);
    }

    @Test
    void startSession_clonaLaPlantillaEnUnaEmpresaDistintaYSinTocarla() {
        DemoSession session = demoSessionService.startSession();
        Company clone = session.getCompany();

        assertThat(clone.getId()).isNotEqualTo(template.getId());
        assertThat(clone.getIsTemplate()).isFalse();
        assertThat(productRepository.findByCompanyId(clone.getId())).hasSize(1);
        assertThat(customerRepository.findByCompanyId(clone.getId())).hasSize(1);

        // La plantilla permanece intacta
        assertThat(productRepository.findByCompanyId(template.getId())).hasSize(1);
        assertThat(customerRepository.findByCompanyId(template.getId())).hasSize(1);
    }

    @Test
    void dosSesiones_estanAisladasEntreSiYDeLaPlantilla() {
        Company cloneA = demoSessionService.startSession().getCompany();
        Company cloneB = demoSessionService.startSession().getCompany();

        Customer soloA = new Customer();
        soloA.setCompany(cloneA);
        soloA.setName("Solo de A");
        customerRepository.save(soloA);

        assertThat(customerRepository.findByCompanyId(cloneA.getId())).hasSize(2);
        assertThat(customerRepository.findByCompanyId(cloneB.getId())).hasSize(1);
        assertThat(customerRepository.findByCompanyId(template.getId())).hasSize(1);
    }

    @Test
    void cleanup_purgaSesionCaducadaConSusDatosYRespetaLasFks() {
        DemoSession session = demoSessionService.startSession();
        Long companyId = session.getCompany().getId();

        session.setExpiresAt(LocalDateTime.now().minusHours(1));
        demoSessionRepository.save(session);

        demoCleanupService.cleanupExpiredSessions();

        assertThat(demoSessionRepository.findById(session.getId())).isEmpty();
        assertThat(companyRepository.findById(companyId)).isEmpty();
        assertThat(productRepository.findByCompanyId(companyId)).isEmpty();
        assertThat(customerRepository.findByCompanyId(companyId)).isEmpty();
        assertThat(categoryRepository.findByCompanyId(companyId)).isEmpty();

        // La plantilla no se ve afectada
        assertThat(companyRepository.findById(template.getId())).isPresent();
    }
}
