package com.flowmetrics.backend.controller;

import org.springframework.http.ResponseCookie;

import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import com.flowmetrics.backend.entity.DemoSession;
import com.flowmetrics.backend.service.DemoSessionService;
import com.flowmetrics.backend.service.DemoCleanupService;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;

@RestController
@RequestMapping("/api/demo")
public class DemoSessionController {

    private static final String COOKIE_NAME = "demoSession";

    private final DemoSessionService demoSessionService;
    private final DemoCleanupService demoCleanupService;
    private final boolean cookieSecure;
    private final boolean cleanupEndpointEnabled;

    public DemoSessionController(DemoSessionService demoSessionService,
                                 DemoCleanupService demoCleanupService,
                                 @Value("${app.demo.cookie.secure:false}") boolean cookieSecure,
                                 @Value("${app.demo.cleanup.endpoint.enabled:true}") boolean cleanupEndpointEnabled) {
        this.demoSessionService = demoSessionService;
        this.demoCleanupService = demoCleanupService;
        this.cookieSecure = cookieSecure;
        this.cleanupEndpointEnabled = cleanupEndpointEnabled;
    }

    @PostMapping("/cleanup")
    public ResponseEntity<String> triggerCleanup() {
        if (!cleanupEndpointEnabled) {
            return ResponseEntity.notFound().build();
        }
        demoCleanupService.cleanupExpiredSessions();
        return ResponseEntity.ok("Limpieza ejecutada");
    }

    @PostMapping("/start")
    public ResponseEntity<Map<String, Object>> startDemo() {

        DemoSession session = demoSessionService.startSession();

        ResponseCookie cookie = ResponseCookie.from(COOKIE_NAME, session.getSessionToken())
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .maxAge(java.time.Duration.ofHours(2))
                .sameSite("Lax")
                .build();

        return ResponseEntity.ok()
                .header("Set-Cookie", cookie.toString())
                .body(Map.of(
                        "companyId", session.getCompany().getId(),
                        "companyName", session.getCompany().getName(),
                        "expiresAt", session.getExpiresAt().toString()
                ));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getCurrentSession(HttpServletRequest request) {

        String token = extractCookie(request);

        if (token == null) {
            return ResponseEntity.status(401).body(Map.of("error", "No hay sesión de demo activa"));
        }

        DemoSession session = demoSessionService.getActiveSession(token);

        return ResponseEntity.ok(Map.of(
                "companyId", session.getCompany().getId(),
                "companyName", session.getCompany().getName(),
                "expiresAt", session.getExpiresAt().toString()
        ));
    }

    private String extractCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }
        for (jakarta.servlet.http.Cookie cookie : request.getCookies()) {
            if (COOKIE_NAME.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}