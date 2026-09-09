package com.flowmetrics.backend.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.flowmetrics.backend.entity.Product;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCompanyId(Long companyId);
}