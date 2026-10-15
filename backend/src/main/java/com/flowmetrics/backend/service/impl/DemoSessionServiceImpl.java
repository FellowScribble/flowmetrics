package com.flowmetrics.backend.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.flowmetrics.backend.entity.Company;
import com.flowmetrics.backend.entity.DemoSession;
import com.flowmetrics.backend.repository.CompanyRepository;
import com.flowmetrics.backend.repository.DemoSessionRepository;
import com.flowmetrics.backend.service.CompanyCloningService;
import com.flowmetrics.backend.service.DemoSessionService;
import com.flowmetrics.backend.exception.ResourceNotFoundException;

@Service
public class DemoSessionServiceImpl implements DemoSessionService {

    private static final int SESSION_DURATION_HOURS = 2;

    private final DemoSessionRepository demoSessionRepository;
    private final CompanyRepository companyRepository;
    private final CompanyCloningService companyCloningService;

    public DemoSessionServiceImpl(DemoSessionRepository demoSessionRepository,
                                   CompanyRepository companyRepository,
                                   CompanyCloningService companyCloningService) {
        this.demoSessionRepository = demoSessionRepository;
        this.companyRepository = companyRepository;
        this.companyCloningService = companyCloningService;
    }

    @Override
    @Transactional
    public DemoSession startSession() {

        List<Company> templates = companyRepository.findByIsTemplateTrue();

        if (templates.isEmpty()) {
            throw new ResourceNotFoundException("No hay ninguna empresa plantilla configurada");
        }

        Company template = templates.get(0);

        Company clonedCompany = companyCloningService.cloneCompany(template);

        DemoSession session = new DemoSession();
        session.setCompany(clonedCompany);
        session.setSessionToken(UUID.randomUUID().toString());
        session.setIsActive(true);
        session.setExpiresAt(LocalDateTime.now().plusHours(SESSION_DURATION_HOURS));

        return demoSessionRepository.save(session);
    }

    @Override
    public DemoSession getActiveSession(String sessionToken) {

        DemoSession session = demoSessionRepository.findBySessionToken(sessionToken)
                .orElseThrow(() -> new ResourceNotFoundException("Sesión de demo no encontrada o caducada"));

        if (!session.getIsActive() || session.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResourceNotFoundException("Sesión de demo no encontrada o caducada");
        }

        return session;
    }
}