package com.example.rmsandroid.models;

public class CartItem {
    private FoodInfo food;
    private int quantity;
    
    public CartItem(FoodInfo food, int quantity) {
        this.food = food;
        this.quantity = quantity;
    }
    
    public FoodInfo getFood() {
        return food;
    }
    
    public void setFood(FoodInfo food) {
        this.food = food;
    }
    
    public int getQuantity() {
        return quantity;
    }
    
    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
    
    public double getSubtotal() {
        return food.getUnitPrice() * quantity;
    }
}
