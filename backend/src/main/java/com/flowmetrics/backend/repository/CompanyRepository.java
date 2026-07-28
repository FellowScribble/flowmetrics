package com.flowmetrics.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.flowmetrics.backend.entity.Company;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {

}
