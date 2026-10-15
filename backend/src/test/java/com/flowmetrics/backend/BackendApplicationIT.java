package com.flowmetrics.backend;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;

import com.flowmetrics.backend.config.SchedulingConfig;

class BackendApplicationIT extends AbstractIntegrationTest {

    @Autowired
    private ApplicationContext context;

    @Test
    void contextLoads() {
    }

    @Test
    void datasourceApuntaExclusivamenteAlaBdDePruebas() {
        String url = context.getEnvironment().getProperty("spring.datasource.url");

        assertThat(url).isNotNull();
        assertThat(url).endsWith("/flowmetrics_test");
        assertThat(url).doesNotEndWith("/flowmetrics");
    }

    @Test
    void schedulerDesactivadoEnPerfilTest() {
        assertThat(context.getBeansOfType(SchedulingConfig.class)).isEmpty();
    }
}
