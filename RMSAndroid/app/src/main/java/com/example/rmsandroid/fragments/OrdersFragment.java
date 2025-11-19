package com.example.rmsandroid.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.rmsandroid.R;
import com.facebook.shimmer.ShimmerFrameLayout;
import com.example.rmsandroid.adapters.OrderAdapter;
import com.example.rmsandroid.api.ApiService;
import com.example.rmsandroid.api.RetrofitClient;
import com.example.rmsandroid.models.Order;
import com.example.rmsandroid.utils.SessionManager;
import com.example.rmsandroid.utils.ToastUtils;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class OrdersFragment extends Fragment implements OrderAdapter.OnOrderClickListener {
    
    private RecyclerView recyclerView;
    private ProgressBar progressBar;
    private LinearLayout tvEmpty;
    private ShimmerFrameLayout shimmerLayout;
    
    private OrderAdapter adapter;
    private ApiService apiService;
    private SessionManager sessionManager;
    
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, 
                             @Nullable ViewGroup container, 
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_orders, container, false);
    }
    
    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        
        initViews(view);
        setupRecyclerView();
        loadOrders();
    }
    
    private void initViews(View view) {
        recyclerView = view.findViewById(R.id.recycler_view);
        progressBar = view.findViewById(R.id.progress_bar);
        tvEmpty = view.findViewById(R.id.tv_empty);
        shimmerLayout = view.findViewById(R.id.shimmer_layout);
        
        apiService = RetrofitClient.getApiService();
        sessionManager = new SessionManager(requireContext());
    }
    
    private void setupRecyclerView() {
        adapter = new OrderAdapter(this);
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        recyclerView.setAdapter(adapter);
    }
    
    private void loadOrders() {
        // Show shimmer loading
        shimmerLayout.startShimmer();
        shimmerLayout.setVisibility(View.VISIBLE);
        recyclerView.setVisibility(View.GONE);
        tvEmpty.setVisibility(View.GONE);
        
        String userId = String.valueOf(sessionManager.getUser().getUserId());
        
        apiService.getUserOrders(userId).enqueue(new Callback<List<Order>>() {
            @Override
            public void onResponse(Call<List<Order>> call, Response<List<Order>> response) {
                shimmerLayout.stopShimmer();
                shimmerLayout.setVisibility(View.GONE);
                
                if (response.isSuccessful() && response.body() != null) {
                    List<Order> orders = response.body();
                    
                    if (orders.isEmpty()) {
                        tvEmpty.setVisibility(View.VISIBLE);
                    } else {
                        adapter.setOrderList(orders);
                        recyclerView.setVisibility(View.VISIBLE);
                    }
                } else {
                    tvEmpty.setVisibility(View.VISIBLE);
                    ToastUtils.showError(getContext(), "Không thể tải đơn hàng");
                }
            }
            
            @Override
            public void onFailure(Call<List<Order>> call, Throwable t) {
                shimmerLayout.stopShimmer();
                shimmerLayout.setVisibility(View.GONE);
                tvEmpty.setVisibility(View.VISIBLE);
                ToastUtils.showError(getContext(), "Lỗi kết nối: " + t.getMessage());
            }
        });
    }
    
    @Override
    public void onOrderClick(Order order) {
        ToastUtils.showInfo(getContext(), "Đơn hàng #" + order.getOrderId());
        // TODO: Show order details dialog or navigate to order detail screen
    }
    
    @Override
    public void onResume() {
        super.onResume();
        // Reload orders when returning to this fragment
        loadOrders();
    }
}
