package com.example.rmsandroid.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.fragment.app.Fragment;

import com.example.rmsandroid.R;
import com.example.rmsandroid.fragments.FavoritesFragment;
import com.example.rmsandroid.fragments.MenuFragment;
import com.example.rmsandroid.fragments.OrdersFragment;
import com.example.rmsandroid.fragments.ProfileFragment;
import com.example.rmsandroid.utils.CartManager;
import com.example.rmsandroid.utils.SessionManager;
import com.google.android.material.bottomnavigation.BottomNavigationView;

public class MainActivity extends AppCompatActivity {
    
    private BottomNavigationView bottomNav;
    private SessionManager sessionManager;
    private CartManager cartManager;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        
        sessionManager = new SessionManager(this);
        cartManager = new CartManager(this);
        
        // Check if logged in
        if (!sessionManager.isLoggedIn()) {
            navigateToLogin();
            return;
        }
        
        // Setup toolbar
        androidx.appcompat.widget.Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);
        if (getSupportActionBar() != null) {
            getSupportActionBar().setTitle("RMS Customer");
        }
        
        // Initialize bottom navigation
        bottomNav = findViewById(R.id.bottom_navigation);
        bottomNav.setOnNavigationItemSelectedListener(navListener);
        
        // Load default fragment
        if (savedInstanceState == null) {
            getSupportFragmentManager().beginTransaction()
                .replace(R.id.fragment_container, new MenuFragment())
                .commit();
        }
    }
    
    private final BottomNavigationView.OnNavigationItemSelectedListener navListener = 
        new BottomNavigationView.OnNavigationItemSelectedListener() {
            @Override
            public boolean onNavigationItemSelected(@NonNull MenuItem item) {
                Fragment selectedFragment = null;
                
                int itemId = item.getItemId();
                if (itemId == R.id.nav_menu) {
                    selectedFragment = new MenuFragment();
                } else if (itemId == R.id.nav_favorites) {
                    selectedFragment = new FavoritesFragment();
                } else if (itemId == R.id.nav_orders) {
                    selectedFragment = new OrdersFragment();
                } else if (itemId == R.id.nav_profile) {
                    selectedFragment = new ProfileFragment();
                }
                
                if (selectedFragment != null) {
                    getSupportFragmentManager().beginTransaction()
                        .replace(R.id.fragment_container, selectedFragment)
                        .commit();
                    return true;
                }
                
                return false;
            }
        };
    
    private void navigateToLogin() {
        Intent intent = new Intent(this, LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }
    
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.main_menu, menu);
        updateCartBadge(menu);
        return true;
    }
    
    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        if (item.getItemId() == R.id.action_cart) {
            Intent intent = new Intent(this, CartActivity.class);
            startActivity(intent);
            return true;
        }
        return super.onOptionsItemSelected(item);
    }
    
    private void updateCartBadge(Menu menu) {
        MenuItem cartItem = menu.findItem(R.id.action_cart);
        if (cartItem != null) {
            int count = cartManager.getCartItemCount();
            if (count > 0) {
                cartItem.setTitle("Giỏ (" + count + ")");
            } else {
                cartItem.setTitle("Giỏ hàng");
            }
        }
    }
    
    @Override
    protected void onResume() {
        super.onResume();
        invalidateOptionsMenu(); // Refresh cart badge
    }
    
    @Override
    public void onBackPressed() {
        // Check if MenuFragment is currently shown
        Fragment currentFragment = getSupportFragmentManager().findFragmentById(R.id.fragment_container);
        if (!(currentFragment instanceof MenuFragment)) {
            // Navigate back to MenuFragment
            bottomNav.setSelectedItemId(R.id.nav_menu);
        } else {
            // Exit app
            super.onBackPressed();
        }
    }
}
