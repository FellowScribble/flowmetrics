package com.flowmetrics.backend;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

/**
 * Base de las pruebas de integración.
 *
 * <p>Fuerza el perfil {@code test}, que apunta exclusivamente a la BD de pruebas
 * {@code flowmetrics_test} (ver {@code src/test/resources/application-test.properties}).
 * Nunca debe usarse con la BD de desarrollo {@code flowmetrics}.
 *
 * <p>{@code @Transactional} revierte cada método de prueba, de modo que el esquema y los datos
 * de {@code flowmetrics_test} no quedan modificados entre ejecuciones.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public abstract class AbstractIntegrationTest {
}
