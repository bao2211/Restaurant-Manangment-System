package com.example.rmsandroid.models;

import com.google.gson.annotations.SerializedName;

public class TableInfo {
    @SerializedName("tableId")
    private String tableId;
    
    @SerializedName("tableName")
    private String tableName;
    
    @SerializedName("status")
    private String status;
    
    @SerializedName("numOfSeats")
    private Integer numOfSeats;
    
    // Constructors
    public TableInfo() {}
    
    // Getters and Setters
    public String getTableId() {
        return tableId;
    }
    
    public void setTableId(String tableId) {
        this.tableId = tableId;
    }
    
    public String getTableName() {
        return tableName;
    }
    
    public void setTableName(String tableName) {
        this.tableName = tableName;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
    
    public Integer getNumOfSeats() {
        return numOfSeats;
    }
    
    public void setNumOfSeats(Integer numOfSeats) {
        this.numOfSeats = numOfSeats;
    }
}
