package com.flowmetrics.backend.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import com.flowmetrics.backend.entity.Sale;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    List<Sale> findByCompanyId(Long companyId);
}