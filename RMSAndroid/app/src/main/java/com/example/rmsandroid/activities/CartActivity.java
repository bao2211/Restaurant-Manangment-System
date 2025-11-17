package com.example.rmsandroid.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;
import androidx.appcompat.app.AppCompatActivity;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.rmsandroid.R;
import com.example.rmsandroid.adapters.CartAdapter;
import com.example.rmsandroid.models.CartItem;
import com.example.rmsandroid.utils.CartManager;
import com.example.rmsandroid.utils.FormatUtils;

import java.util.List;

public class CartActivity extends AppCompatActivity implements CartAdapter.OnCartItemListener {
    
    private RecyclerView recyclerView;
    private TextView tvEmpty, tvTotal, tvClearCart;
    private Button btnCheckout;
    private View layoutBottom;
    
    private CartAdapter adapter;
    private CartManager cartManager;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_cart);
        
        initViews();
        setupRecyclerView();
        loadCart();
    }
    
    private void initViews() {
        recyclerView = findViewById(R.id.recycler_view);
        tvEmpty = findViewById(R.id.tv_empty);
        tvTotal = findViewById(R.id.tv_total);
        tvClearCart = findViewById(R.id.tv_clear_cart);
        btnCheckout = findViewById(R.id.btn_checkout);
        layoutBottom = findViewById(R.id.layout_bottom);
        
        cartManager = new CartManager(this);
        
        tvClearCart.setOnClickListener(v -> showClearCartDialog());
        btnCheckout.setOnClickListener(v -> goToCheckout());
    }
    
    private void setupRecyclerView() {
        adapter = new CartAdapter(this);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        recyclerView.setAdapter(adapter);
    }
    
    private void loadCart() {
        List<CartItem> cartItems = cartManager.getCart();
        
        if (cartItems.isEmpty()) {
            tvEmpty.setVisibility(View.VISIBLE);
            layoutBottom.setVisibility(View.GONE);
        } else {
            tvEmpty.setVisibility(View.GONE);
            layoutBottom.setVisibility(View.VISIBLE);
            adapter.setCartItems(cartItems);
            updateTotal();
        }
    }
    
    private void updateTotal() {
        double total = cartManager.getCartTotal();
        tvTotal.setText(FormatUtils.formatPrice(total));
    }
    
    @Override
    public void onQuantityChanged(CartItem item, int newQuantity) {
        cartManager.updateQuantity(item.getFood().getFoodId(), newQuantity);
        loadCart();
    }
    
    @Override
    public void onRemoveItem(CartItem item) {
        new AlertDialog.Builder(this)
                .setTitle("Xóa món ăn")
                .setMessage("Bạn có chắc muốn xóa " + item.getFood().getFoodName() + " khỏi giỏ hàng?")
                .setPositiveButton("Xóa", (dialog, which) -> {
                    cartManager.removeFromCart(item.getFood().getFoodId());
                    loadCart();
                    Toast.makeText(this, "Đã xóa khỏi giỏ hàng", Toast.LENGTH_SHORT).show();
                })
                .setNegativeButton("Hủy", null)
                .show();
    }
    
    private void showClearCartDialog() {
        new AlertDialog.Builder(this)
                .setTitle("Xóa giỏ hàng")
                .setMessage("Bạn có chắc muốn xóa tất cả món ăn trong giỏ hàng?")
                .setPositiveButton("Xóa", (dialog, which) -> {
                    cartManager.clearCart();
                    loadCart();
                    Toast.makeText(this, "Đã xóa giỏ hàng", Toast.LENGTH_SHORT).show();
                })
                .setNegativeButton("Hủy", null)
                .show();
    }
    
    private void goToCheckout() {
        Intent intent = new Intent(this, CheckoutActivity.class);
        startActivity(intent);
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        loadCart();
    }
}
