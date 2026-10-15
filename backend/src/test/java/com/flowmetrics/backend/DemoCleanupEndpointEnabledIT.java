package com.flowmetrics.backend;

import static org.assertj.core.api.Assertions.assertThat;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;

/**
 * Verifica que con el valor por defecto de la propiedad (true; perfiles local y test)
 * el endpoint manual POST /api/demo/cleanup sigue funcionando: 200 con confirmación.
 * Se ejecuta sobre flowmetrics_test (BD vacía de sesiones caducadas => es un no-op seguro).
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class DemoCleanupEndpointEnabledIT {

    @LocalServerPort
    private int port;

    @Test
    void cleanupManualHabilitado_responde200() throws Exception {
        HttpResponse<String> response = post("/api/demo/cleanup");

        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).contains("Limpieza ejecutada");
    }

    private HttpResponse<String> post(String path) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
                .header("Accept", "application/json")
                .POST(HttpRequest.BodyPublishers.noBody())
                .build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }
}
