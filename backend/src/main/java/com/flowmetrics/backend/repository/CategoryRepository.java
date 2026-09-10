package com.flowmetrics.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

import com.flowmetrics.backend.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
	List<Category> findByCompanyId(Long companyId);
}