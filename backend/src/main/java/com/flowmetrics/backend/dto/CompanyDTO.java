package com.flowmetrics.backend.dto;

public class CompanyDTO {

    private Long id;

    private String name;

    private String industry;

    private String country;

    private String currency;

    public CompanyDTO() {
    }

    public CompanyDTO(Long id, String name, String industry, String country, String currency) {
        this.id = id;
        this.name = name;
        this.industry = industry;
        this.country = country;
        this.currency = currency;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getIndustry() {
        return industry;
    }

    public void setIndustry(String industry) {
        this.industry = industry;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

}
