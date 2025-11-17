package com.example.rmsandroid.models;

import com.google.gson.annotations.SerializedName;

public class Order {
    @SerializedName("orderId")
    private String orderId;
    
    @SerializedName("status")
    private String status;
    
    @SerializedName("total")
    private double total;
    
    @SerializedName("note")
    private String note;
    
    @SerializedName("discount")
    private double discount;
    
    @SerializedName("tableId")
    private String tableId;
    
    @SerializedName("userId")
    private String userId;
    
    @SerializedName("createdTime")
    private String createdTime;
    
    @SerializedName("reservationId")
    private String reservationId;
    
    // Constructors
    public Order() {}
    
    // Getters and Setters
    public String getOrderId() {
        return orderId;
    }
    
    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public double getTotal() {
        return total;
    }
    
    public void setTotal(double total) {
        this.total = total;
    }
    
    public String getNote() {
        return note;
    }
    
    public void setNote(String note) {
        this.note = note;
    }
    
    public double getDiscount() {
        return discount;
    }
    
    public void setDiscount(double discount) {
        this.discount = discount;
    }
    
    public String getTableId() {
        return tableId;
    }
    
    public void setTableId(String tableId) {
        this.tableId = tableId;
    }
    
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getCreatedTime() {
        return createdTime;
    }
    
    public void setCreatedTime(String createdTime) {
        this.createdTime = createdTime;
    }
    
    public String getReservationId() {
        return reservationId;
    }
    
    public void setReservationId(String reservationId) {
        this.reservationId = reservationId;
    }
}
