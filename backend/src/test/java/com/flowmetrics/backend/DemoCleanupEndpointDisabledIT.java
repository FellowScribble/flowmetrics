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
 * Verifica que con app.demo.cleanup.endpoint.enabled=false (perfil prod) el endpoint
 * manual POST /api/demo/cleanup queda deshabilitado (404) y no expone su lógica.
 * El @Scheduled de DemoCleanupServiceImpl no depende de esta propiedad.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = "app.demo.cleanup.endpoint.enabled=false")
@ActiveProfiles("test")
class DemoCleanupEndpointDisabledIT {

    @LocalServerPort
    private int port;

    @Test
    void cleanupManualDeshabilitado_responde404() throws Exception {
        HttpResponse<String> response = post("/api/demo/cleanup");

        assertThat(response.statusCode()).isEqualTo(404);
        assertThat(response.body()).isEmpty();
    }

    @Test
    void cleanupManualDeshabilitado_noEjecutaLimpieza() throws Exception {
        // Segunda llamada: también 404 (el guard actúa antes del servicio).
        HttpResponse<String> first = post("/api/demo/cleanup");
        HttpResponse<String> second = post("/api/demo/cleanup");

        assertThat(first.statusCode()).isEqualTo(404);
        assertThat(second.statusCode()).isEqualTo(404);
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
