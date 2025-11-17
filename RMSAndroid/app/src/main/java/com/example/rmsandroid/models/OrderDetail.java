package com.example.rmsandroid.models;

import com.google.gson.annotations.SerializedName;

public class OrderDetail {
    @SerializedName("foodId")
    private String foodId;
    
    @SerializedName("foodName")
    private String foodName;
    
    @SerializedName("orderId")
    private String orderId;
    
    @SerializedName("quantity")
    private Integer quantity;
    
    @SerializedName("unitPrice")
    private Double unitPrice;
    
    @SerializedName("status")
    private String status;
    
    // Constructors
    public OrderDetail() {}
    
    public OrderDetail(String foodId, String orderId, Integer quantity, Double unitPrice, String status) {
        this.foodId = foodId;
        this.orderId = orderId;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.status = status;
    }
    
    // Getters and Setters
    public String getFoodId() {
        return foodId;
    }
    
    public void setFoodId(String foodId) {
        this.foodId = foodId;
    }
    
    public String getOrderId() {
        return orderId;
    }
    
    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }
    
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
    
    public Double getUnitPrice() {
        return unitPrice;
    }
    
    public void setUnitPrice(Double unitPrice) {
        this.unitPrice = unitPrice;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public String getFoodName() {
        return foodName;
    }
    
    public void setFoodName(String foodName) {
        this.foodName = foodName;
    }
}
