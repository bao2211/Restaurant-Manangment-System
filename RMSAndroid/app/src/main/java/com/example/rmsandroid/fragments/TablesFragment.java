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
import androidx.recyclerview.widget.GridLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.example.rmsandroid.R;
import com.example.rmsandroid.adapters.TableAdapter;
import com.example.rmsandroid.api.ApiService;
import com.example.rmsandroid.api.RetrofitClient;
import com.example.rmsandroid.models.TableInfo;

import java.util.List;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class TablesFragment extends Fragment implements TableAdapter.OnTableClickListener {
    
    private RecyclerView recyclerView;
    private ProgressBar progressBar;
    private TextView tvEmpty;
    
    private TableAdapter adapter;
    private ApiService apiService;
    
    @Nullable
    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, 
                             @Nullable ViewGroup container, 
                             @Nullable Bundle savedInstanceState) {
        return inflater.inflate(R.layout.fragment_tables, container, false);
    }
    
    @Override
    public void onViewCreated(@NonNull View view, @Nullable Bundle savedInstanceState) {
        super.onViewCreated(view, savedInstanceState);
        
        initViews(view);
        setupRecyclerView();
        loadTables();
    }
    
    private void initViews(View view) {
        recyclerView = view.findViewById(R.id.recycler_view);
        progressBar = view.findViewById(R.id.progress_bar);
        tvEmpty = view.findViewById(R.id.tv_empty);
        
        apiService = RetrofitClient.getApiService();
    }
    
    private void setupRecyclerView() {
        adapter = new TableAdapter(this);
        // Use grid layout with 2 columns for tables
        recyclerView.setLayoutManager(new GridLayoutManager(getContext(), 1));
        recyclerView.setAdapter(adapter);
    }
    
    private void loadTables() {
        progressBar.setVisibility(View.VISIBLE);
        tvEmpty.setVisibility(View.GONE);
        
        apiService.getAllTables().enqueue(new Callback<List<TableInfo>>() {
            @Override
            public void onResponse(Call<List<TableInfo>> call, Response<List<TableInfo>> response) {
                progressBar.setVisibility(View.GONE);
                
                if (response.isSuccessful() && response.body() != null) {
                    List<TableInfo> tables = response.body();
                    
                    if (tables.isEmpty()) {
                        tvEmpty.setVisibility(View.VISIBLE);
                    } else {
                        adapter.setTableList(tables);
                    }
                } else {
                    tvEmpty.setVisibility(View.VISIBLE);
                    Toast.makeText(getContext(), "Không thể tải danh sách bàn", Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<List<TableInfo>> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                tvEmpty.setVisibility(View.VISIBLE);
                Toast.makeText(getContext(), "Lỗi kết nối: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    @Override
    public void onBookTable(TableInfo table) {
        Toast.makeText(getContext(), 
            "Đặt " + table.getTableName() + " thành công!\n(Tính năng đang phát triển)", 
            Toast.LENGTH_LONG).show();
        // TODO: Implement table booking functionality
        // This could create a new order with the selected table
    }
    
    @Override
    public void onResume() {
        super.onResume();
        // Reload tables when returning to this fragment
        loadTables();
    }
}
