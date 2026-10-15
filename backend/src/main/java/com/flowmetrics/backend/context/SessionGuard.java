package com.flowmetrics.backend.context;

import org.springframework.stereotype.Component;

import com.flowmetrics.backend.exception.ResourceNotFoundException;
import com.flowmetrics.backend.exception.UnauthorizedException;

/**
 * Guarda de aislamiento multi-tenant. Obtiene el {@code companyId} autorizado
 * exclusivamente de la sesión de demo del servidor ({@link DemoContext}); nunca
 * del identificador enviado por el cliente.
 */
@Component
public class SessionGuard {

    private final DemoContext demoContext;

    public SessionGuard(DemoContext demoContext) {
        this.demoContext = demoContext;
    }

    /**
     * Devuelve el {@code companyId} de la sesión o lanza {@link UnauthorizedException}
     * (HTTP 401) si no hay una sesión de demo activa.
     */
    public Long requireCompanyId() {
        Long companyId = demoContext.getCompanyId();

        if (companyId == null) {
            throw new UnauthorizedException("Se requiere una sesión de demo activa para acceder a estos datos.");
        }

        return companyId;
    }

    /**
     * Comprueba que un recurso pertenece a la empresa de la sesión. Si no hay sesión
     * lanza 401; si el recurso es de otra empresa (o no tiene empresa) lanza 404 para
     * no revelar su existencia.
     */
    public void requireOwnership(Long resourceCompanyId, String resourceName, Long resourceId) {
        Long sessionCompanyId = requireCompanyId();

        if (resourceCompanyId == null || !sessionCompanyId.equals(resourceCompanyId)) {
            throw new ResourceNotFoundException(resourceName + " no encontrado con id " + resourceId);
        }
    }
}
