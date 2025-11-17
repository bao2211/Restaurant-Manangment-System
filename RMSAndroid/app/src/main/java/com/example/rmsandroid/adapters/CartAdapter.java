package com.example.rmsandroid.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.bumptech.glide.Glide;
import com.example.rmsandroid.R;
import com.example.rmsandroid.models.CartItem;
import com.example.rmsandroid.utils.FormatUtils;

import java.util.ArrayList;
import java.util.List;

public class CartAdapter extends RecyclerView.Adapter<CartAdapter.CartViewHolder> {
    
    private List<CartItem> cartItems;
    private OnCartItemListener listener;
    
    public interface OnCartItemListener {
        void onQuantityChanged(CartItem item, int newQuantity);
        void onRemoveItem(CartItem item);
    }
    
    public CartAdapter(OnCartItemListener listener) {
        this.cartItems = new ArrayList<>();
        this.listener = listener;
    }
    
    public void setCartItems(List<CartItem> cartItems) {
        this.cartItems = cartItems != null ? cartItems : new ArrayList<>();
        notifyDataSetChanged();
    }
    
    @NonNull
    @Override
    public CartViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_cart, parent, false);
        return new CartViewHolder(view);
    }
    
    @Override
    public void onBindViewHolder(@NonNull CartViewHolder holder, int position) {
        holder.bind(cartItems.get(position));
    }
    
    @Override
    public int getItemCount() {
        return cartItems.size();
    }
    
    class CartViewHolder extends RecyclerView.ViewHolder {
        private ImageView ivFoodImage, btnDecrease, btnIncrease, btnRemove;
        private TextView tvFoodName, tvPrice, tvQuantity;
        
        public CartViewHolder(@NonNull View itemView) {
            super(itemView);
            ivFoodImage = itemView.findViewById(R.id.iv_food_image);
            tvFoodName = itemView.findViewById(R.id.tv_food_name);
            tvPrice = itemView.findViewById(R.id.tv_price);
            tvQuantity = itemView.findViewById(R.id.tv_quantity);
            btnDecrease = itemView.findViewById(R.id.btn_decrease);
            btnIncrease = itemView.findViewById(R.id.btn_increase);
            btnRemove = itemView.findViewById(R.id.btn_remove);
        }
        
        public void bind(CartItem item) {
            tvFoodName.setText(item.getFood().getFoodName());
            tvPrice.setText(FormatUtils.formatPrice(item.getFood().getUnitPrice()));
            tvQuantity.setText(String.valueOf(item.getQuantity()));
            
            // Load image
            if (item.getFood().getFoodImage() != null && !item.getFood().getFoodImage().isEmpty()) {
                Glide.with(itemView.getContext())
                        .load(item.getFood().getFoodImage())
                        .placeholder(android.R.drawable.ic_menu_gallery)
                        .error(android.R.drawable.ic_menu_gallery)
                        .into(ivFoodImage);
            } else {
                ivFoodImage.setImageResource(android.R.drawable.ic_menu_gallery);
            }
            
            // Click listeners
            btnDecrease.setOnClickListener(v -> {
                int newQty = item.getQuantity() - 1;
                if (listener != null) {
                    listener.onQuantityChanged(item, newQty);
                }
            });
            
            btnIncrease.setOnClickListener(v -> {
                int newQty = item.getQuantity() + 1;
                if (listener != null) {
                    listener.onQuantityChanged(item, newQty);
                }
            });
            
            btnRemove.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onRemoveItem(item);
                }
            });
        }
    }
}
