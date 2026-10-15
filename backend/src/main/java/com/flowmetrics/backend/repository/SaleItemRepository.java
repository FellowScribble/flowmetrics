package com.flowmetrics.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.flowmetrics.backend.entity.SaleItem;

public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {

    @Query(value = """
        SELECT p.name AS product_name, SUM(si.quantity) AS total_quantity, SUM(si.subtotal) AS total_revenue
        FROM sale_items si
        JOIN products p ON p.id = si.product_id
        JOIN sales s ON s.id = si.sale_id
        WHERE s.company_id = :companyId
        GROUP BY p.name
        ORDER BY total_quantity DESC
        LIMIT 5
        """, nativeQuery = true)
    List<Object[]> getTopProducts(@Param("companyId") Long companyId);
}