package com.example.rmsandroid.fragments;

import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.rmsandroid.utils.ToastUtils;
import com.facebook.shimmer.ShimmerFrameLayout;

import com.example.rmsandroid.R;
import com.example.rmsandroid.adapters.FoodAdapter;
import com.example.rmsandroid.api.ApiService;
import com.example.rmsandroid.api.RetrofitClient;
import com.example.rmsandroid.models.FoodInfo;
import com.example.rmsandroid.models.UserFavorite;
import com.example.rmsandroid.utils.SessionManager;

import java.util.ArrayList;
import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class MenuFragment extends Fragment implements FoodAdapter.OnFoodClickListener {
    
    private RecyclerView recyclerView;
    private ProgressBar progressBar;
    private LinearLayout tvEmpty;
    private EditText etSearch;
    private ShimmerFrameLayout shimmerLayout;
    
    private FoodAdapter adapter;
    private ApiService apiService;
    private SessionManager sessionManager;
    private List<FoodInfo> allFoods;
    
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, 
                             @Nullable ViewGroup container, 
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_menu, container, false);
    }
    
    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        
        initViews(view);
        setupRecyclerView();
        loadFoodItems();
    }
    
    private void initViews(View view) {
        recyclerView = view.findViewById(R.id.recycler_view);
        progressBar = view.findViewById(R.id.progress_bar);
        tvEmpty = view.findViewById(R.id.tv_empty);
        etSearch = view.findViewById(R.id.et_search);
        shimmerLayout = view.findViewById(R.id.shimmer_layout);
        
        apiService = RetrofitClient.getApiService();
        sessionManager = new SessionManager(requireContext());
        allFoods = new ArrayList<>();
        
        // Setup search
        etSearch.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {}
            
            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                filterFoods(s.toString());
            }
            
            @Override
            public void afterTextChanged(Editable s) {}
        });
    }
    
    private void setupRecyclerView() {
        adapter = new FoodAdapter(this);
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        recyclerView.setAdapter(adapter);
    }
    
    private void loadFoodItems() {
        // Show shimmer loading
        shimmerLayout.startShimmer();
        shimmerLayout.setVisibility(View.VISIBLE);
        recyclerView.setVisibility(View.GONE);
        tvEmpty.setVisibility(View.GONE);
        
        apiService.getAllFoods().enqueue(new Callback<List<FoodInfo>>() {
            @Override
            public void onResponse(Call<List<FoodInfo>> call, Response<List<FoodInfo>> response) {
                shimmerLayout.stopShimmer();
                shimmerLayout.setVisibility(View.GONE);
                
                if (response.isSuccessful() && response.body() != null) {
                    allFoods = response.body();
                    
                    if (allFoods.isEmpty()) {
                        tvEmpty.setVisibility(View.VISIBLE);
                    } else {
                        loadUserFavorites();
                    }
                } else {
                    tvEmpty.setVisibility(View.VISIBLE);
                    ToastUtils.showError(getContext(), "Không thể tải danh sách món ăn");
                }
            }
            
            @Override
            public void onFailure(Call<List<FoodInfo>> call, Throwable t) {
                shimmerLayout.stopShimmer();
                shimmerLayout.setVisibility(View.GONE);
                tvEmpty.setVisibility(View.VISIBLE);
                ToastUtils.showError(getContext(), "Lỗi kết nối: " + t.getMessage());
            }
        });
    }
    
    private void loadUserFavorites() {
        String userId = String.valueOf(sessionManager.getUser().getUserId());
        
        apiService.getUserFavorites(userId).enqueue(new Callback<List<UserFavorite>>() {
            @Override
            public void onResponse(Call<List<UserFavorite>> call, Response<List<UserFavorite>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<UserFavorite> favorites = response.body();
                    
                    // Mark favorite foods
                    for (FoodInfo food : allFoods) {
                        for (UserFavorite fav : favorites) {
                            if (food.getFoodId() != null && food.getFoodId().trim().equals(fav.getFoodId() != null ? fav.getFoodId().trim() : "")) {
                                food.setFavorite(true);
                                break;
                            }
                        }
                    }
                }
                
                adapter.setFoodList(allFoods);
                recyclerView.setVisibility(View.VISIBLE);
            }
            
            @Override
            public void onFailure(Call<List<UserFavorite>> call, Throwable t) {
                // Still show foods even if favorites fail to load
                adapter.setFoodList(allFoods);
                recyclerView.setVisibility(View.VISIBLE);
            }
        });
    }
    
    private void filterFoods(String query) {
        if (query.isEmpty()) {
            adapter.setFoodList(allFoods);
            return;
        }
        
        List<FoodInfo> filtered = new ArrayList<>();
        for (FoodInfo food : allFoods) {
            if (food.getFoodName().toLowerCase().contains(query.toLowerCase()) ||
                (food.getDescription() != null && food.getDescription().toLowerCase().contains(query.toLowerCase()))) {
                filtered.add(food);
            }
        }
        adapter.setFoodList(filtered);
    }
    
    @Override
    public void onFoodClick(FoodInfo food) {
        // Show add to cart dialog
        showAddToCartDialog(food);
    }
    
    private void showAddToCartDialog(FoodInfo food) {
        android.app.AlertDialog.Builder builder = new android.app.AlertDialog.Builder(getContext());
        builder.setTitle(food.getFoodName());
        builder.setMessage("Thêm vào giỏ hàng?");
        
        // Quantity selector
        final android.widget.EditText input = new android.widget.EditText(getContext());
        input.setInputType(android.text.InputType.TYPE_CLASS_NUMBER);
        input.setHint("Số lượng");
        input.setText("1");
        builder.setView(input);
        
        builder.setPositiveButton("Thêm vào giỏ", (dialog, which) -> {
            String qtyStr = input.getText().toString();
            int quantity = 1;
            try {
                quantity = Integer.parseInt(qtyStr);
                if (quantity < 1) quantity = 1;
            } catch (Exception e) {
                quantity = 1;
            }
            
            com.example.rmsandroid.utils.CartManager cartManager = 
                new com.example.rmsandroid.utils.CartManager(requireContext());
            cartManager.addToCart(food, quantity);
            
            ToastUtils.showSuccess(getContext(), 
                "Đã thêm " + quantity + " " + food.getFoodName() + " vào giỏ hàng");
        });
        
        builder.setNegativeButton("Hủy", null);
        builder.show();
    }
    
    @Override
    public void onFavoriteClick(FoodInfo food) {
        String userId = String.valueOf(sessionManager.getUser().getUserId());
        String foodId = food.getFoodId() != null ? food.getFoodId().trim() : "";
        
        if (food.isFavorite()) {
            // Remove from favorites
            android.util.Log.d("MenuFragment", "Removing favorite - userId: " + userId + ", foodId: " + foodId);
            apiService.removeFavorite(userId, foodId).enqueue(new Callback<Void>() {
                @Override
                public void onResponse(Call<Void> call, Response<Void> response) {
                    if (response.isSuccessful()) {
                        food.setFavorite(false);
                        adapter.updateFood(food);
                        ToastUtils.showSuccess(getContext(), "Đã xóa khỏi yêu thích");
                    } else {
                        android.util.Log.e("MenuFragment", "Remove favorite failed: " + response.code() + " - " + response.message());
                        ToastUtils.showError(getContext(), "Không thể xóa: " + response.message());
                    }
                }
                
                @Override
                public void onFailure(Call<Void> call, Throwable t) {
                    android.util.Log.e("MenuFragment", "Remove favorite error: " + t.getMessage(), t);
                    ToastUtils.showError(getContext(), "Lỗi: " + t.getMessage());
                }
            });
        } else {
            // Add to favorites
            UserFavorite favorite = new UserFavorite(userId, foodId);
            android.util.Log.d("MenuFragment", "Adding favorite - userId: " + userId + ", foodId: " + foodId);
            apiService.addFavorite(favorite).enqueue(new Callback<UserFavorite>() {
                @Override
                public void onResponse(Call<UserFavorite> call, Response<UserFavorite> response) {
                    if (response.isSuccessful()) {
                        food.setFavorite(true);
                        adapter.updateFood(food);
                        ToastUtils.showSuccess(getContext(), "Đã thêm vào yêu thích");
                    } else {
                        android.util.Log.e("MenuFragment", "Add favorite failed: " + response.code() + " - " + response.message());
                        try {
                            String errorBody = response.errorBody() != null ? response.errorBody().string() : "No error body";
                            android.util.Log.e("MenuFragment", "Error body: " + errorBody);
                            ToastUtils.showError(getContext(), "Không thể thêm: " + response.message());
                        } catch (Exception e) {
                            ToastUtils.showError(getContext(), "Không thể thêm vào yêu thích");
                        }
                    }
                }
                
                @Override
                public void onFailure(Call<UserFavorite> call, Throwable t) {
                    android.util.Log.e("MenuFragment", "Add favorite error: " + t.getMessage(), t);
                    ToastUtils.showError(getContext(), "Lỗi: " + t.getMessage());
                }
            });
        }
    }
}
