package com.example.rmsandroid.models;

import com.google.gson.annotations.SerializedName;

public class Category {
    @SerializedName("cateId")
    private String cateId;
    
    @SerializedName("cateName")
    private String cateName;
    
    @SerializedName("description")
    private String description;
    
    // Constructors
    public Category() {}
    
    // Getters and Setters
    public String getCateId() {
        return cateId;
    }
    
    public void setCateId(String cateId) {
        this.cateId = cateId;
    }
    
    public String getCateName() {
        return cateName;
    }
    
    public void setCateName(String cateName) {
        this.cateName = cateName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
}
