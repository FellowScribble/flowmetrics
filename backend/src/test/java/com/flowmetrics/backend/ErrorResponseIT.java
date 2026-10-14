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
 * Verifica que las respuestas de error no filtran información interna (traza/mensaje técnico).
 * Cubre el riesgo 11: errores no gestionados por {@code GlobalExceptionHandler}.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
class ErrorResponseIT {

    @LocalServerPort
    private int port;

    @Test
    void metodoNoPermitido_noExponeTrazaNiStackTrace() throws Exception {
        HttpResponse<String> response = get("/api/demo/cleanup");

        assertThat(response.statusCode()).isEqualTo(405);
        assertThat(response.body()).doesNotContain("\"trace\"");
        assertThat(response.body()).doesNotContain("Exception");
        assertThat(response.body()).doesNotContain("org.springframework");
    }

    @Test
    void rutaInexistente_noExponeTrazaNiStackTrace() throws Exception {
        HttpResponse<String> response = get("/api/ruta-que-no-existe");

        assertThat(response.statusCode()).isIn(404, 405);
        assertThat(response.body()).doesNotContain("\"trace\"");
        assertThat(response.body()).doesNotContain("org.springframework");
    }

    private HttpResponse<String> get(String path) throws Exception {
        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder(URI.create("http://localhost:" + port + path))
                .header("Accept", "application/json")
                .GET()
                .build();
        return client.send(request, HttpResponse.BodyHandlers.ofString());
    }
}
