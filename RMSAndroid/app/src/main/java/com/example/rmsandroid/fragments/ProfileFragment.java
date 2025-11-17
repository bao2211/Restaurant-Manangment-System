package com.example.rmsandroid.fragments;

import android.content.Intent;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;

import com.example.rmsandroid.R;
import com.example.rmsandroid.activities.LoginActivity;
import com.example.rmsandroid.models.User;
import com.example.rmsandroid.utils.SessionManager;

public class ProfileFragment extends Fragment {
    
    private TextView tvFullName, tvUsername, tvEmail, tvPhone, tvRole;
    private Button btnLogout;
    
    private SessionManager sessionManager;
    
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, 
                             @Nullable ViewGroup container, 
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_profile, container, false);
    }
    
    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        
        initViews(view);
        loadUserData();
        setupLogoutButton();
    }
    
    private void initViews(View view) {
        tvFullName = view.findViewById(R.id.tv_full_name);
        tvUsername = view.findViewById(R.id.tv_username);
        tvEmail = view.findViewById(R.id.tv_email);
        tvPhone = view.findViewById(R.id.tv_phone);
        tvRole = view.findViewById(R.id.tv_role);
        btnLogout = view.findViewById(R.id.btn_logout);
        
        sessionManager = new SessionManager(requireContext());
    }
    
    private void loadUserData() {
        User user = sessionManager.getUser();
        
        if (user != null) {
            tvFullName.setText(user.getFullName() != null ? user.getFullName() : "Khách hàng");
            tvUsername.setText("@" + user.getUserName());
            tvEmail.setText(user.getEmail() != null ? user.getEmail() : "Chưa cập nhật");
            tvPhone.setText(user.getPhone() != null ? user.getPhone() : "Chưa cập nhật");
            tvRole.setText(user.getRole() != null ? user.getRole() : "Customer");
        }
    }
    
    private void setupLogoutButton() {
        btnLogout.setOnClickListener(v -> {
            // Logout
            sessionManager.logout();
            
            // Navigate to login
            Intent intent = new Intent(getActivity(), LoginActivity.class);
            intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
            startActivity(intent);
            
            if (getActivity() != null) {
                getActivity().finish();
            }
        });
    }
}
