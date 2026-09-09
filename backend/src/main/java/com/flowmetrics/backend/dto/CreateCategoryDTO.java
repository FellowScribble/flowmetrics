package com.flowmetrics.backend.dto;

public class CreateCategoryDTO {

    private Long companyId;
    private String name;
    private String description;

    public CreateCategoryDTO() {
    }

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}