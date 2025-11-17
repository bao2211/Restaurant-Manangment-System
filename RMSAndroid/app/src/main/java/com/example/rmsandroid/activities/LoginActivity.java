package com.example.rmsandroid.activities;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.rmsandroid.R;
import com.example.rmsandroid.api.ApiService;
import com.example.rmsandroid.api.RetrofitClient;
import com.example.rmsandroid.models.User;
import com.example.rmsandroid.utils.SessionManager;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class LoginActivity extends AppCompatActivity {
    
    private EditText etUsername, etPassword;
    private Button btnLogin;
    private TextView tvRegister;
    private ProgressBar progressBar;
    
    private ApiService apiService;
    private SessionManager sessionManager;
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);
        
        // Initialize
        initViews();
        apiService = RetrofitClient.getApiService();
        sessionManager = new SessionManager(this);
        
        // Check if already logged in
        if (sessionManager.isLoggedIn()) {
            navigateToMain();
            return;
        }
        
        setupClickListeners();
    }
    
    private void initViews() {
        etUsername = findViewById(R.id.et_username);
        etPassword = findViewById(R.id.et_password);
        btnLogin = findViewById(R.id.btn_login);
        tvRegister = findViewById(R.id.tv_register);
        progressBar = findViewById(R.id.progress_bar);
    }
    
    private void setupClickListeners() {
        btnLogin.setOnClickListener(v -> login());
        
        tvRegister.setOnClickListener(v -> {
            Intent intent = new Intent(LoginActivity.this, RegisterActivity.class);
            startActivity(intent);
        });
    }
    
    private void login() {
        String username = etUsername.getText().toString().trim();
        String password = etPassword.getText().toString().trim();
        
        // Validation
        if (username.isEmpty()) {
            etUsername.setError("Vui lòng nhập tên đăng nhập");
            etUsername.requestFocus();
            return;
        }
        
        if (password.isEmpty()) {
            etPassword.setError("Vui lòng nhập mật khẩu");
            etPassword.requestFocus();
            return;
        }
        
        // Show loading
        progressBar.setVisibility(View.VISIBLE);
        btnLogin.setEnabled(false);
        
        // Create credentials
        User credentials = new User(username, password);
        
        // API call
        apiService.login(credentials).enqueue(new Callback<User>() {
            @Override
            public void onResponse(Call<User> call, Response<User> response) {
                progressBar.setVisibility(View.GONE);
                btnLogin.setEnabled(true);
                
                if (response.isSuccessful() && response.body() != null) {
                    User user = response.body();
                    
                    // Check if user is a customer
                    if (!"Customer".equalsIgnoreCase(user.getRole())) {
                        Toast.makeText(LoginActivity.this, 
                            "Ứng dụng này chỉ dành cho khách hàng", 
                            Toast.LENGTH_LONG).show();
                        return;
                    }
                    
                    // Save session
                    sessionManager.saveUser(user);
                    
                    Toast.makeText(LoginActivity.this, 
                        "Đăng nhập thành công!", 
                        Toast.LENGTH_SHORT).show();
                    
                    navigateToMain();
                } else {
                    Toast.makeText(LoginActivity.this, 
                        "Tên đăng nhập hoặc mật khẩu không đúng", 
                        Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<User> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                btnLogin.setEnabled(true);
                Toast.makeText(LoginActivity.this, 
                    "Lỗi kết nối: " + t.getMessage(), 
                    Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    private void navigateToMain() {
        Intent intent = new Intent(LoginActivity.this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }
}
