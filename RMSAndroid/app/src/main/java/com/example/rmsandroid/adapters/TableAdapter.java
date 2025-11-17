package com.example.rmsandroid.adapters;

import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.example.rmsandroid.R;
import com.example.rmsandroid.models.TableInfo;
import com.example.rmsandroid.utils.FormatUtils;

import java.util.ArrayList;
import java.util.List;

public class TableAdapter extends RecyclerView.Adapter<TableAdapter.TableViewHolder> {
    
    private List<TableInfo> tableList;
    private OnTableClickListener listener;
    
    public interface OnTableClickListener {
        void onBookTable(TableInfo table);
    }
    
    public TableAdapter(OnTableClickListener listener) {
        this.tableList = new ArrayList<>();
        this.listener = listener;
    }
    
    public void setTableList(List<TableInfo> tableList) {
        this.tableList = tableList != null ? tableList : new ArrayList<>();
        notifyDataSetChanged();
    }
    
    @NonNull
    @Override
    public TableViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View view = LayoutInflater.from(parent.getContext())
                .inflate(R.layout.item_table, parent, false);
        return new TableViewHolder(view);
    }
    
    @Override
    public void onBindViewHolder(@NonNull TableViewHolder holder, int position) {
        holder.bind(tableList.get(position));
    }
    
    @Override
    public int getItemCount() {
        return tableList.size();
    }
    
    class TableViewHolder extends RecyclerView.ViewHolder {
        private TextView tvTableName, tvCapacity, tvStatus;
        private Button btnBook;
        
        public TableViewHolder(@NonNull View itemView) {
            super(itemView);
            tvTableName = itemView.findViewById(R.id.tv_table_name);
            tvCapacity = itemView.findViewById(R.id.tv_capacity);
            tvStatus = itemView.findViewById(R.id.tv_status);
            btnBook = itemView.findViewById(R.id.btn_book);
        }
        
        public void bind(TableInfo table) {
            tvTableName.setText(table.getTableName());
            Integer seats = table.getNumOfSeats();
            tvCapacity.setText("Sức chứa: " + (seats != null ? seats : 0) + " người");
            
            // Set status
            String status = table.getStatus();
            boolean isAvailable = "Available".equalsIgnoreCase(status) || "Trống".equalsIgnoreCase(status);
            
            if (isAvailable) {
                tvStatus.setText("Trống");
                tvStatus.setTextColor(0xFF4CAF50); // Green
                tvStatus.setBackgroundColor(0xFFE8F5E9); // Light green
                btnBook.setVisibility(View.VISIBLE);
                btnBook.setEnabled(true);
            } else {
                tvStatus.setText("Đã đặt");
                tvStatus.setTextColor(0xFFF44336); // Red
                tvStatus.setBackgroundColor(0xFFFFEBEE); // Light red
                btnBook.setVisibility(View.GONE);
            }
            
            btnBook.setOnClickListener(v -> {
                if (listener != null) {
                    listener.onBookTable(table);
                }
            });
        }
    }
}
