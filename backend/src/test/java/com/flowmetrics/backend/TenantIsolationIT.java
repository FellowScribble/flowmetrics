package com.flowmetrics.backend;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.flowmetrics.backend.entity.Category;
import com.flowmetrics.backend.entity.Company;
import com.flowmetrics.backend.entity.Customer;
import com.flowmetrics.backend.entity.DemoSession;
import com.flowmetrics.backend.repository.CategoryRepository;
import com.flowmetrics.backend.repository.CompanyRepository;
import com.flowmetrics.backend.repository.CustomerRepository;
import com.flowmetrics.backend.repository.DemoSessionRepository;
import com.flowmetrics.backend.repository.ProductRepository;
import com.flowmetrics.backend.repository.SaleRepository;

import jakarta.servlet.http.Cookie;

/**
 * Aislamiento multi-tenant (riesgo 16). Verifica, a nivel HTTP y con el filtro de sesión real,
 * que las lecturas y escrituras de clientes, categorías, productos, ventas, informes y actividad
 * exigen una sesión de demo válida y que el {@code companyId} autorizado proviene de la sesión,
 * no del cliente.
 *
 * <p>Usa el perfil {@code test} ({@code flowmetrics_test}, ver {@link AbstractIntegrationTest}) y
 * revierte cada prueba, por lo que no toca la BD de desarrollo.
 */
@AutoConfigureMockMvc
class TenantIsolationIT extends AbstractIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private CompanyRepository companyRepository;
    @Autowired private CategoryRepository categoryRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private SaleRepository saleRepository;
    @Autowired private DemoSessionRepository demoSessionRepository;

    private Company companyA;
    private Company companyB;
    private Customer customerA;
    private Customer customerB;
    private Category categoryB;
    private Cookie cookieA;

    @BeforeEach
    void setUp() {
        companyA = saveCompany("Empresa A");
        companyB = saveCompany("Empresa B");

        customerA = saveCustomer(companyA, "Cliente de A");
        customerB = saveCustomer(companyB, "Cliente de B");

        categoryB = new Category();
        categoryB.setCompany(companyB);
        categoryB.setName("Categoría de B");
        categoryB = categoryRepository.save(categoryB);

        cookieA = sessionCookie(companyA, "token-a");
    }

    // --- Sin sesión: todas las operaciones de datos exigen sesión (401) ---

    @Test
    void sinSesion_lasLecturasDeDatosDevuelven401() throws Exception {
        for (String url : new String[] {
                "/api/customers", "/api/categories", "/api/products",
                "/api/sales", "/api/reports/summary", "/api/activity" }) {
            mockMvc.perform(get(url))
                    .andExpect(status().isUnauthorized());
        }
    }

    @Test
    void sinSesion_lasEscriturasDevuelven401YNoCreanNada() throws Exception {
        mockMvc.perform(post("/api/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"companyId\":" + companyA.getId() + ",\"name\":\"Intruso\",\"isActive\":true}"))
                .andExpect(status().isUnauthorized());

        assertThat(customerRepository.findByCompanyId(companyA.getId())).hasSize(1);
        assertThat(customerRepository.findByCompanyId(companyB.getId())).hasSize(1);
    }

    // --- Con sesión de A: solo ve y toca los datos de A ---

    @Test
    void conSesionA_lasLecturasSoloDevuelvenDatosDeA() throws Exception {
        mockMvc.perform(get("/api/customers").cookie(cookieA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].companyId").value(companyA.getId()));

        mockMvc.perform(get("/api/categories").cookie(cookieA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        mockMvc.perform(get("/api/products").cookie(cookieA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        mockMvc.perform(get("/api/sales").cookie(cookieA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void conSesionA_noPuedeLeerUnRecursoDeB() throws Exception {
        mockMvc.perform(get("/api/customers/" + customerB.getId()).cookie(cookieA))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/categories/" + categoryB.getId()).cookie(cookieA))
                .andExpect(status().isNotFound());
    }

    @Test
    void conSesionA_elCompanyIdEnviadoPorElClienteNoAutorizaAOtraEmpresa() throws Exception {
        mockMvc.perform(get("/api/customers").param("companyId", companyB.getId().toString()).cookie(cookieA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].companyId").value(companyA.getId()));

        mockMvc.perform(get("/api/reports/summary").param("companyId", companyB.getId().toString()).cookie(cookieA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.activeCustomers").value(1));
    }

    @Test
    void conSesionA_crearConCompanyIdDeB_seCreaEnA() throws Exception {
        mockMvc.perform(post("/api/customers")
                        .cookie(cookieA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"companyId\":" + companyB.getId() + ",\"name\":\"Inyectado\",\"isActive\":true}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.companyId").value(companyA.getId()));

        assertThat(customerRepository.findByCompanyId(companyA.getId())).hasSize(2);
        assertThat(customerRepository.findByCompanyId(companyB.getId())).hasSize(1);
    }

    @Test
    void conSesionA_noPuedeModificarNiBorrarRecursosDeB() throws Exception {
        mockMvc.perform(put("/api/customers/" + customerB.getId())
                        .cookie(cookieA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Hackeado\",\"isActive\":true}"))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/customers/" + customerB.getId()).cookie(cookieA))
                .andExpect(status().isNotFound());

        assertThat(customerRepository.findById(customerB.getId())).isPresent();
    }

    @Test
    void conSesionA_noPuedeCrearProductoConCategoriaDeB() throws Exception {
        mockMvc.perform(post("/api/products")
                        .cookie(cookieA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"categoryId\":" + categoryB.getId() + ",\"name\":\"Cruzado\"," +
                                "\"salePrice\":10.0,\"costPrice\":5.0,\"stock\":1,\"minimumStock\":0,\"isActive\":true}"))
                .andExpect(status().isNotFound());

        assertThat(productRepository.findByCompanyId(companyA.getId())).isEmpty();
        assertThat(saleRepository.findByCompanyId(companyA.getId())).isEmpty();
    }

    // --- Helpers ---

    private Company saveCompany(String name) {
        Company company = new Company();
        company.setName(name);
        company.setIndustry("Tecnología");
        company.setCountry("España");
        company.setCurrency("EUR");
        company.setIsTemplate(false);
        return companyRepository.save(company);
    }

    private Customer saveCustomer(Company company, String name) {
        Customer customer = new Customer();
        customer.setCompany(company);
        customer.setName(name);
        customer.setIsActive(true);
        return customerRepository.save(customer);
    }

    private Cookie sessionCookie(Company company, String token) {
        DemoSession session = new DemoSession();
        session.setCompany(company);
        session.setSessionToken(token);
        session.setIsActive(true);
        session.setExpiresAt(LocalDateTime.now().plusHours(2));
        demoSessionRepository.save(session);
        return new Cookie("demoSession", token);
    }
}
