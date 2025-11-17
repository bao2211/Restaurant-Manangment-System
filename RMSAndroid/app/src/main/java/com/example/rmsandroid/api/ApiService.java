package com.example.rmsandroid.api;

import com.example.rmsandroid.models.Category;
import com.example.rmsandroid.models.FoodInfo;
import com.example.rmsandroid.models.Order;
import com.example.rmsandroid.models.OrderDetail;
import com.example.rmsandroid.models.TableInfo;
import com.example.rmsandroid.models.User;
import com.example.rmsandroid.models.UserFavorite;

import java.util.List;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.DELETE;
import retrofit2.http.GET;
import retrofit2.http.POST;
import retrofit2.http.PUT;
import retrofit2.http.Path;

public interface ApiService {
    
    // ==================== User Endpoints ====================
    
    @POST("User/login")
    Call<User> login(@Body User credentials);
    
    @GET("User/{userId}")
    Call<User> getUser(@Path("userId") String userId);
    
    @POST("User")
    Call<User> registerUser(@Body User user);
    
    @PUT("User/{userId}")
    Call<User> updateUser(@Path("userId") String userId, @Body User user);
    
    // ==================== Food Endpoints ====================
    
    @GET("FoodInfo")
    Call<List<FoodInfo>> getAllFoods();
    
    @GET("FoodInfo/{foodId}")
    Call<FoodInfo> getFood(@Path("foodId") String foodId);
    
    @GET("FoodInfo/category/{categoryId}")
    Call<List<FoodInfo>> getFoodsByCategory(@Path("categoryId") String categoryId);
    
    // ==================== Category Endpoints ====================
    
    @GET("Category")
    Call<List<Category>> getAllCategories();
    
    @GET("Category/{categoryId}")
    Call<Category> getCategory(@Path("categoryId") String categoryId);
    
    // ==================== Order Endpoints ====================
    
    @GET("Order")
    Call<List<Order>> getAllOrders();
    
    @GET("Order/{orderId}")
    Call<Order> getOrder(@Path("orderId") String orderId);
    
    @GET("Order/user/{userId}")
    Call<List<Order>> getUserOrders(@Path("userId") String userId);
    
    @POST("Order")
    Call<Order> createOrder(@Body Order order);
    
    @PUT("Order/{orderId}")
    Call<Order> updateOrder(@Path("orderId") String orderId, @Body Order order);
    
    // ==================== OrderDetail Endpoints ====================
    
    @GET("OrderDetail")
    Call<List<OrderDetail>> getAllOrderDetails();
    
    @GET("OrderDetail/order/{orderId}")
    Call<List<OrderDetail>> getOrderDetails(@Path("orderId") String orderId);
    
    @POST("OrderDetail")
    Call<OrderDetail> createOrderDetail(@Body OrderDetail orderDetail);
    
    // ==================== Table Endpoints ====================
    
    @GET("Table")
    Call<List<TableInfo>> getAllTables();
    
    @GET("Table/{tableId}")
    Call<TableInfo> getTable(@Path("tableId") String tableId);
    
    @GET("Table/available")
    Call<List<TableInfo>> getAvailableTables();
    
    @PUT("Table/{tableId}")
    Call<TableInfo> updateTable(@Path("tableId") String tableId, @Body TableInfo table);
    
    // ==================== Favorites Endpoints ====================
    
    @GET("UserFavorite/user/{userId}")
    Call<List<UserFavorite>> getUserFavorites(@Path("userId") String userId);
    
    @POST("UserFavorite")
    Call<UserFavorite> addFavorite(@Body UserFavorite favorite);
    
    @DELETE("UserFavorite/user/{userId}/food/{foodId}")
    Call<Void> removeFavorite(@Path("userId") String userId, @Path("foodId") String foodId);
}
