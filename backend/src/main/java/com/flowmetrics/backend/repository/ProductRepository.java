package com.flowmetrics.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import com.flowmetrics.backend.entity.Product;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCompanyId(Long companyId);
    
    @Query("SELECT COUNT(p) FROM Product p WHERE p.company.id = :companyId AND p.stock <= p.minimumStock")
    long countLowStock(@Param("companyId") Long companyId);
}