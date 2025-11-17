package com.example.rmsandroid.models;

import com.google.gson.annotations.SerializedName;

public class UserFavorite {
    @SerializedName("userId")
    private String userId;
    
    @SerializedName("foodId")
    private String foodId;
    
    // Constructors
    public UserFavorite() {}
    
    public UserFavorite(String userId, String foodId) {
        this.userId = userId;
        this.foodId = foodId;
    }
    
    // Getters and Setters
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getFoodId() {
        return foodId;
    }
    
    public void setFoodId(String foodId) {
        this.foodId = foodId;
    }
}
