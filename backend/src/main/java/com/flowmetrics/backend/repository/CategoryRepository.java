package com.flowmetrics.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.flowmetrics.backend.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}