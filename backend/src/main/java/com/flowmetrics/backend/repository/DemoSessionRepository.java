package com.flowmetrics.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import com.flowmetrics.backend.entity.DemoSession;

public interface DemoSessionRepository extends JpaRepository<DemoSession, Long> {

    Optional<DemoSession> findBySessionToken(String sessionToken);

    List<DemoSession> findByIsActiveTrueAndExpiresAtBefore(LocalDateTime now);
}