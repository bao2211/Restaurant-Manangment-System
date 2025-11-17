package com.example.rmsandroid.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.rmsandroid.R;
import com.example.rmsandroid.api.ApiService;
import com.example.rmsandroid.api.RetrofitClient;
import com.example.rmsandroid.models.Order;
import com.example.rmsandroid.models.OrderDetail;
import com.example.rmsandroid.utils.FormatUtils;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class OrderAdapter extends RecyclerView.Adapter<OrderAdapter.OrderViewHolder> {
    
    private List<Order> orderList;
    private OnOrderClickListener listener;
    private Set<String> expandedOrderIds;
    private ApiService apiService;
    
    public interface OnOrderClickListener {
        void onOrderClick(Order order);
    }
    
    public OrderAdapter(OnOrderClickListener listener) {
        this.orderList = new ArrayList<>();
        this.listener = listener;
        this.expandedOrderIds = new HashSet<>();
        this.apiService = RetrofitClient.getApiService();
    }
    
    public void setOrderList(List<Order> orderList) {
        this.orderList = orderList != null ? orderList : new ArrayList<>();
        this.expandedOrderIds.clear();
        notifyDataSetChanged();
    }
    
    @NonNull
    @Override
    public OrderViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_order, parent, false);
        return new OrderViewHolder(view);
    }
    
    @Override
    public void onBindViewHolder(@NonNull OrderViewHolder holder, int position) {
        holder.bind(orderList.get(position));
    }
    
    @Override
    public int getItemCount() {
        return orderList.size();
    }
    
    class OrderViewHolder extends RecyclerView.ViewHolder {
        private TextView tvOrderId, tvStatus, tvTable, tvTime, tvDiscount, tvTotal, tvNote;
        private TextView tvExpandIcon, tvNoItems;
        private LinearLayout layoutHeader, layoutOrderDetails, layoutItems;
        private ProgressBar progressDetails;
        
        public OrderViewHolder(@NonNull View itemView) {
            super(itemView);
            tvOrderId = itemView.findViewById(R.id.tv_order_id);
            tvStatus = itemView.findViewById(R.id.tv_status);
            tvTable = itemView.findViewById(R.id.tv_table);
            tvTime = itemView.findViewById(R.id.tv_time);
            tvDiscount = itemView.findViewById(R.id.tv_discount);
            tvTotal = itemView.findViewById(R.id.tv_total);
            tvNote = itemView.findViewById(R.id.tv_note);
            tvExpandIcon = itemView.findViewById(R.id.tv_expand_icon);
            tvNoItems = itemView.findViewById(R.id.tv_no_items);
            layoutHeader = itemView.findViewById(R.id.layout_header);
            layoutOrderDetails = itemView.findViewById(R.id.layout_order_details);
            layoutItems = itemView.findViewById(R.id.layout_items);
            progressDetails = itemView.findViewById(R.id.progress_details);
        }
        
        public void bind(Order order) {
            tvOrderId.setText("Đơn hàng #" + order.getOrderId());
            tvStatus.setText(FormatUtils.getStatusText(order.getStatus()));
            tvStatus.setTextColor(FormatUtils.getStatusColor(order.getStatus()));
            
            tvTable.setText(order.getTableId() != null ? "Bàn " + order.getTableId() : "Chưa có");
            
            // Format time
            if (order.getCreatedTime() != null) {
                try {
                    SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy HH:mm", Locale.getDefault());
                    tvTime.setText(sdf.format(order.getCreatedTime()));
                } catch (Exception e) {
                    tvTime.setText("N/A");
                }
            } else {
                tvTime.setText("N/A");
            }
            
            tvDiscount.setText(FormatUtils.formatPrice(order.getDiscount()));
            tvTotal.setText(FormatUtils.formatPrice(order.getTotal()));
            
            // Show note if exists
            if (order.getNote() != null && !order.getNote().isEmpty()) {
                tvNote.setVisibility(View.VISIBLE);
                tvNote.setText("Ghi chú: " + order.getNote());
            } else {
                tvNote.setVisibility(View.GONE);
            }
            
            // Handle expansion state
            boolean isExpanded = expandedOrderIds.contains(order.getOrderId());
            layoutOrderDetails.setVisibility(isExpanded ? View.VISIBLE : View.GONE);
            tvExpandIcon.setText(isExpanded ? "▲" : "▼");
            
            // Set click listener for header to expand/collapse
            layoutHeader.setOnClickListener(v -> {
                if (expandedOrderIds.contains(order.getOrderId())) {
                    // Collapse
                    expandedOrderIds.remove(order.getOrderId());
                    layoutOrderDetails.setVisibility(View.GONE);
                    tvExpandIcon.setText("▼");
                } else {
                    // Expand and load details
                    expandedOrderIds.add(order.getOrderId());
                    layoutOrderDetails.setVisibility(View.VISIBLE);
                    tvExpandIcon.setText("▲");
                    loadOrderDetails(order.getOrderId());
                }
            });
            
            // If already expanded, ensure details are loaded
            if (isExpanded && layoutItems.getChildCount() == 0) {
                loadOrderDetails(order.getOrderId());
            }
        }
        
        private void loadOrderDetails(String orderId) {
            // Show loading
            progressDetails.setVisibility(View.VISIBLE);
            tvNoItems.setVisibility(View.GONE);
            layoutItems.removeAllViews();
            
            // Load order details from API
            apiService.getOrderDetails(orderId).enqueue(new Callback<List<OrderDetail>>() {
                @Override
                public void onResponse(Call<List<OrderDetail>> call, Response<List<OrderDetail>> response) {
                    progressDetails.setVisibility(View.GONE);
                    
                    if (response.isSuccessful() && response.body() != null) {
                        List<OrderDetail> details = response.body();
                        
                        if (details.isEmpty()) {
                            tvNoItems.setVisibility(View.VISIBLE);
                        } else {
                            // Add each order detail as a row
                            for (OrderDetail detail : details) {
                                View itemView = LayoutInflater.from(layoutItems.getContext())
                                        .inflate(R.layout.item_order_detail, layoutItems, false);
                                
                                TextView tvFoodName = itemView.findViewById(R.id.tv_food_name);
                                TextView tvQuantity = itemView.findViewById(R.id.tv_quantity);
                                TextView tvPrice = itemView.findViewById(R.id.tv_price);
                                TextView tvSubtotal = itemView.findViewById(R.id.tv_subtotal);
                                
                                tvFoodName.setText(detail.getFoodName() != null ? detail.getFoodName() : "N/A");
                                tvQuantity.setText("x" + detail.getQuantity());
                                tvPrice.setText(FormatUtils.formatPrice(detail.getUnitPrice()));
                                
                                double subtotal = detail.getQuantity() * (detail.getUnitPrice() != null ? detail.getUnitPrice() : 0);
                                tvSubtotal.setText(FormatUtils.formatPrice(subtotal));
                                
                                layoutItems.addView(itemView);
                            }
                        }
                    } else {
                        tvNoItems.setVisibility(View.VISIBLE);
                    }
                }
                
                @Override
                public void onFailure(Call<List<OrderDetail>> call, Throwable t) {
                    progressDetails.setVisibility(View.GONE);
                    tvNoItems.setVisibility(View.VISIBLE);
                    tvNoItems.setText("Lỗi tải chi tiết: " + t.getMessage());
                }
            });
        }
    }
}
