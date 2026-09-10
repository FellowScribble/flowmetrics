package com.flowmetrics.backend.filter;

import java.io.IOException;
import java.time.LocalDateTime;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.flowmetrics.backend.context.DemoContext;
import com.flowmetrics.backend.repository.DemoSessionRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class DemoSessionFilter extends OncePerRequestFilter {

    private static final String COOKIE_NAME = "demoSession";

    private final DemoSessionRepository demoSessionRepository;
    private final DemoContext demoContext;

    public DemoSessionFilter(DemoSessionRepository demoSessionRepository, DemoContext demoContext) {
        this.demoSessionRepository = demoSessionRepository;
        this.demoContext = demoContext;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {

        String token = extractCookie(request);

        if (token != null) {
            demoSessionRepository.findBySessionToken(token).ifPresent(session -> {
                boolean valid = session.getIsActive() && session.getExpiresAt().isAfter(LocalDateTime.now());
                if (valid) {
                    demoContext.setCompanyId(session.getCompany().getId());
                }
            });
        }

        filterChain.doFilter(request, response);
    }

    private String extractCookie(HttpServletRequest request) {
        if (request.getCookies() == null) {
            return null;
        }
        for (Cookie cookie : request.getCookies()) {
            if (COOKIE_NAME.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }
}