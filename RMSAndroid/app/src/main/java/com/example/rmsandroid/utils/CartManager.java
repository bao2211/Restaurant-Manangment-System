package com.example.rmsandroid.utils;

import android.content.Context;
import android.content.SharedPreferences;

import com.example.rmsandroid.models.CartItem;
import com.example.rmsandroid.models.FoodInfo;
import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.lang.reflect.Type;
import java.util.ArrayList;
import java.util.List;

public class CartManager {
    private static final String PREF_NAME = "CartPrefs";
    private static final String KEY_CART = "cart_items";
    
    private SharedPreferences prefs;
    private Gson gson;
    
    public CartManager(Context context) {
        prefs = context.getSharedPreferences(PREF_NAME, Context.MODE_PRIVATE);
        gson = new Gson();
    }
    
    public void addToCart(FoodInfo food, int quantity) {
        List<CartItem> cart = getCart();
        
        // Check if food already in cart
        boolean found = false;
        for (CartItem item : cart) {
            if (item.getFood().getFoodId() == food.getFoodId()) {
                item.setQuantity(item.getQuantity() + quantity);
                found = true;
                break;
            }
        }
        
        if (!found) {
            cart.add(new CartItem(food, quantity));
        }
        
        saveCart(cart);
    }
    
    public void updateQuantity(String foodId, int quantity) {
        List<CartItem> cart = getCart();
        
        if (quantity <= 0) {
            cart.removeIf(item -> item.getFood().getFoodId().equals(foodId));
        } else {
            for (CartItem item : cart) {
                if (item.getFood().getFoodId().equals(foodId)) {
                    item.setQuantity(quantity);
                    break;
                }
            }
        }
        
        saveCart(cart);
    }
    
    public void removeFromCart(String foodId) {
        List<CartItem> cart = getCart();
        cart.removeIf(item -> item.getFood().getFoodId().equals(foodId));
        saveCart(cart);
    }
    
    public List<CartItem> getCart() {
        String json = prefs.getString(KEY_CART, null);
        if (json == null) {
            return new ArrayList<>();
        }
        
        Type type = new TypeToken<List<CartItem>>(){}.getType();
        return gson.fromJson(json, type);
    }
    
    public void clearCart() {
        prefs.edit().remove(KEY_CART).apply();
    }
    
    public int getCartItemCount() {
        List<CartItem> cart = getCart();
        int count = 0;
        for (CartItem item : cart) {
            count += item.getQuantity();
        }
        return count;
    }
    
    public double getCartTotal() {
        List<CartItem> cart = getCart();
        double total = 0;
        for (CartItem item : cart) {
            total += item.getSubtotal();
        }
        return total;
    }
    
    private void saveCart(List<CartItem> cart) {
        String json = gson.toJson(cart);
        prefs.edit().putString(KEY_CART, json).apply();
    }
}
