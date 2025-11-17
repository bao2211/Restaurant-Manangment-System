package com.example.rmsandroid.fragments;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ProgressBar;
import android.widget.TextView;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

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

public class FavoritesFragment extends Fragment implements FoodAdapter.OnFoodClickListener {
    
    private RecyclerView recyclerView;
    private ProgressBar progressBar;
    private TextView tvEmpty;
    
    private FoodAdapter adapter;
    private ApiService apiService;
    private SessionManager sessionManager;
    private List<FoodInfo> favoriteFoods;
    
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, 
                             @Nullable ViewGroup container, 
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_favorites, container, false);
    }
    
    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        
        initViews(view);
        setupRecyclerView();
        loadFavorites();
    }
    
    private void initViews(View view) {
        recyclerView = view.findViewById(R.id.recycler_view);
        progressBar = view.findViewById(R.id.progress_bar);
        tvEmpty = view.findViewById(R.id.tv_empty);
        
        apiService = RetrofitClient.getApiService();
        sessionManager = new SessionManager(requireContext());
        favoriteFoods = new ArrayList<>();
    }
    
    private void setupRecyclerView() {
        adapter = new FoodAdapter(this);
        recyclerView.setLayoutManager(new LinearLayoutManager(getContext()));
        recyclerView.setAdapter(adapter);
    }
    
    private void loadFavorites() {
        progressBar.setVisibility(View.VISIBLE);
        tvEmpty.setVisibility(View.GONE);
        
        String userId = String.valueOf(sessionManager.getUser().getUserId());
        
        // Get user favorites
        apiService.getUserFavorites(userId).enqueue(new Callback<List<UserFavorite>>() {
            @Override
            public void onResponse(Call<List<UserFavorite>> call, Response<List<UserFavorite>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    List<UserFavorite> favorites = response.body();
                    
                    if (favorites.isEmpty()) {
                        progressBar.setVisibility(View.GONE);
                        tvEmpty.setVisibility(View.VISIBLE);
                    } else {
                        loadFavoriteFoodDetails(favorites);
                    }
                } else {
                    progressBar.setVisibility(View.GONE);
                    tvEmpty.setVisibility(View.VISIBLE);
                }
            }
            
            @Override
            public void onFailure(Call<List<UserFavorite>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                tvEmpty.setVisibility(View.VISIBLE);
                Toast.makeText(getContext(), "Lỗi kết nối: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    private void loadFavoriteFoodDetails(List<UserFavorite> favorites) {
        // Get all foods
        apiService.getAllFoods().enqueue(new Callback<List<FoodInfo>>() {
            @Override
            public void onResponse(Call<List<FoodInfo>> call, Response<List<FoodInfo>> response) {
                progressBar.setVisibility(View.GONE);
                
                if (response.isSuccessful() && response.body() != null) {
                    List<FoodInfo> allFoods = response.body();
                    favoriteFoods.clear();
                    
                    // Filter favorite foods
                    for (FoodInfo food : allFoods) {
                        for (UserFavorite fav : favorites) {
                            if (food.getFoodId() == fav.getFoodId()) {
                                food.setFavorite(true);
                                favoriteFoods.add(food);
                                break;
                            }
                        }
                    }
                    
                    adapter.setFoodList(favoriteFoods);
                    
                    if (favoriteFoods.isEmpty()) {
                        tvEmpty.setVisibility(View.VISIBLE);
                    }
                }
            }
            
            @Override
            public void onFailure(Call<List<FoodInfo>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                Toast.makeText(getContext(), "Lỗi tải chi tiết món ăn", Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    @Override
    public void onFoodClick(FoodInfo food) {
        Toast.makeText(getContext(), "Chọn: " + food.getFoodName(), Toast.LENGTH_SHORT).show();
    }
    
    @Override
    public void onFavoriteClick(FoodInfo food) {
        String userId = String.valueOf(sessionManager.getUser().getUserId());
        
        // Remove from favorites
        apiService.removeFavorite(userId, String.valueOf(food.getFoodId())).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if (response.isSuccessful()) {
                    // Remove from list
                    favoriteFoods.remove(food);
                    adapter.setFoodList(favoriteFoods);
                    
                    if (favoriteFoods.isEmpty()) {
                        tvEmpty.setVisibility(View.VISIBLE);
                    }
                    
                    Toast.makeText(getContext(), "Đã xóa khỏi yêu thích", Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                Toast.makeText(getContext(), "Lỗi: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    @Override
    public void onResume() {
        super.onResume();
        // Reload favorites when returning to this fragment
        loadFavorites();
    }
}
