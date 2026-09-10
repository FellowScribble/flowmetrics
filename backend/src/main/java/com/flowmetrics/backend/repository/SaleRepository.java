package com.flowmetrics.backend.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.flowmetrics.backend.entity.Sale;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    List<Sale> findByCompanyId(Long companyId);

    @Query("SELECT COALESCE(SUM(s.total), 0) FROM Sale s WHERE s.company.id = :companyId")
    BigDecimal getTotalRevenue(@Param("companyId") Long companyId);

    @Query("SELECT COALESCE(SUM(s.total), 0) FROM Sale s WHERE s.company.id = :companyId AND s.saleDate >= :start")
    BigDecimal getRevenueSince(@Param("companyId") Long companyId, @Param("start") LocalDateTime start);

    @Query(value = """
        SELECT TO_CHAR(sale_date, 'YYYY-MM') AS month, SUM(total) AS total
        FROM sales
        WHERE company_id = :companyId
        GROUP BY month
        ORDER BY month
        """, nativeQuery = true)
    List<Object[]> getSalesByMonth(@Param("companyId") Long companyId);
}