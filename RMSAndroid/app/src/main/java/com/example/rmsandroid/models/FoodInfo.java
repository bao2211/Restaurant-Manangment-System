package com.example.rmsandroid.models;

import com.google.gson.annotations.SerializedName;

public class FoodInfo {
    @SerializedName("foodId")
    private String foodId;
    
    @SerializedName("foodName")
    private String foodName;
    
    @SerializedName("description")
    private String description;
    
    @SerializedName("unitPrice")
    private double unitPrice;
    
    @SerializedName("cateId")
    private String cateId;
    
    @SerializedName("foodImage")
    private String foodImage;
    
    // For favorites
    private boolean isFavorite;
    
    // Constructors
    public FoodInfo() {}
    
    // Getters and Setters
    public String getFoodId() {
        return foodId;
    }
    
    public void setFoodId(String foodId) {
        this.foodId = foodId;
    }
    
    public String getFoodName() {
        return foodName;
    }
    
    public void setFoodName(String foodName) {
        this.foodName = foodName;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public double getUnitPrice() {
        return unitPrice;
    }
    
    public void setUnitPrice(double unitPrice) {
        this.unitPrice = unitPrice;
    }
    
    public String getCateId() {
        return cateId;
    }
    
    public void setCateId(String cateId) {
        this.cateId = cateId;
    }
    
    public String getFoodImage() {
        return foodImage;
    }
    
    public void setFoodImage(String foodImage) {
        this.foodImage = foodImage;
    }
    
    public boolean isFavorite() {
        return isFavorite;
    }
    
    public void setFavorite(boolean favorite) {
        isFavorite = favorite;
    }
}
