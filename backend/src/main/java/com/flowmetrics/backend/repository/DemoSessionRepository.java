package com.flowmetrics.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.flowmetrics.backend.entity.DemoSession;

public interface DemoSessionRepository extends JpaRepository<DemoSession, Long> {

    @Query("SELECT ds FROM DemoSession ds JOIN FETCH ds.company WHERE ds.sessionToken = :token")
    Optional<DemoSession> findBySessionToken(@Param("token") String token);

    List<DemoSession> findByIsActiveTrueAndExpiresAtBefore(LocalDateTime now);
}