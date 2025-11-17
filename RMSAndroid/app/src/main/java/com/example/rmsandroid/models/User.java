package com.example.rmsandroid.models;

import com.google.gson.annotations.SerializedName;

public class User {
    @SerializedName("userId")
    private String userId;
    
    @SerializedName("userName")
    private String userName;
    
    @SerializedName("password")
    private String password;
    
    @SerializedName("role")
    private String role;
    
    @SerializedName("fullName")
    private String fullName;
    
    @SerializedName("phone")
    private String phone;
    
    @SerializedName("email")
    private String email;
    
    @SerializedName("right")
    private String right;
    
    @SerializedName("status")
    private String status;
    
    // Constructors
    public User() {}
    
    public User(String userName, String password) {
        this.userName = userName;
        this.password = password;
    }
    
    // Getters and Setters
    public String getUserId() {
        return userId;
    }
    
    public void setUserId(String userId) {
        this.userId = userId;
    }
    
    public String getUserName() {
        return userName;
    }
    
    public void setUserName(String userName) {
        this.userName = userName;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public String getRole() {
        return role;
    }
    
    public void setRole(String role) {
        this.role = role;
    }
    
    public String getFullName() {
        return fullName;
    }
    
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    
    public String getPhone() {
        return phone;
    }
    
    public void setPhone(String phone) {
        this.phone = phone;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getRight() {
        return right;
    }
    
    public void setRight(String right) {
        this.right = right;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
}
