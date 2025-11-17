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
import com.example.rmsandroid.models.FoodInfo;
import com.example.rmsandroid.utils.FormatUtils;

import java.util.ArrayList;
import java.util.List;

public class FoodAdapter extends RecyclerView.Adapter<FoodAdapter.FoodViewHolder> {
    
    private List<FoodInfo> foodList;
    private OnFoodClickListener listener;
    
    public interface OnFoodClickListener {
        void onFoodClick(FoodInfo food);
        void onFavoriteClick(FoodInfo food);
    }
    
    public FoodAdapter(OnFoodClickListener listener) {
        this.foodList = new ArrayList<>();
        this.listener = listener;
    }
    
    public void setFoodList(List<FoodInfo> foodList) {
        this.foodList = foodList != null ? foodList : new ArrayList<>();
        notifyDataSetChanged();
    }
    
    public void updateFood(FoodInfo food) {
        for (int i = 0; i < foodList.size(); i++) {
            if (foodList.get(i).getFoodId() != null && 
                foodList.get(i).getFoodId().trim().equals(food.getFoodId() != null ? food.getFoodId().trim() : "")) {
                foodList.set(i, food);
                notifyItemChanged(i);
                break;
            }
        }
    }
    
    @NonNull
    @Override
    public FoodViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_food, parent, false);
        return new FoodViewHolder(view);
    }
    
    @Override
    public void onBindViewHolder(@NonNull FoodViewHolder holder, int position) {
        holder.bind(foodList.get(position));
    }
    
    @Override
    public int getItemCount() {
        return foodList.size();
    }
    
    class FoodViewHolder extends RecyclerView.ViewHolder {
        private ImageView ivFoodImage, ivFavorite;
        private TextView tvFoodName, tvDescription, tvPrice;
        
        public FoodViewHolder(@NonNull View itemView) {
            super(itemView);
            ivFoodImage = itemView.findViewById(R.id.iv_food_image);
            ivFavorite = itemView.findViewById(R.id.iv_favorite);
            tvFoodName = itemView.findViewById(R.id.tv_food_name);
            tvDescription = itemView.findViewById(R.id.tv_description);
            tvPrice = itemView.findViewById(R.id.tv_price);
        }
        
        public void bind(FoodInfo food) {
            tvFoodName.setText(food.getFoodName());
            tvDescription.setText(food.getDescription());
            tvPrice.setText(FormatUtils.formatPrice(food.getUnitPrice()));
            
            // Load image
            if (food.getFoodImage() != null && !food.getFoodImage().isEmpty()) {
                Glide.with(itemView.getContext())
                        .load(food.getFoodImage())
                        .placeholder(android.R.drawable.ic_menu_gallery)
                        .error(android.R.drawable.ic_menu_gallery)
                        .into(ivFoodImage);
            } else {
                ivFoodImage.setImageResource(android.R.drawable.ic_menu_gallery);
            }
            
            // Set favorite icon
            ivFavorite.setImageResource(food.isFavorite() ? 
                    android.R.drawable.star_big_on : 
                    android.R.drawable.star_big_off);
            
            // Click listeners
            itemView.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onFoodClick(food);
                }
            });
            
            ivFavorite.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onFavoriteClick(food);
                }
            });
        }
    }
}
