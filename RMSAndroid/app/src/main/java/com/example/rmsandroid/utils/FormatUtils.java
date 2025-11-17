package com.example.rmsandroid.utils;

import java.text.NumberFormat;
import java.util.Locale;

public class FormatUtils {
    
    // Format price in Vietnamese currency
    public static String formatPrice(double price) {
        NumberFormat format = NumberFormat.getCurrencyInstance(new Locale("vi", "VN"));
        return format.format(price);
    }
    
    // Format price without symbol
    public static String formatPriceSimple(double price) {
        NumberFormat format = NumberFormat.getNumberInstance(new Locale("vi", "VN"));
        return format.format(price) + " đ";
    }
    
    // Get status badge color
    public static int getStatusColor(String status) {
        switch (status) {
            case "Chưa làm":
                return 0xFFFFA726; // Orange
            case "Đang chuẩn bị":
                return 0xFF42A5F5; // Blue
            case "Hoàn tất":
                return 0xFF66BB6A; // Green
            case "Đã hủy":
                return 0xFFEF5350; // Red
            case "Trống":
                return 0xFF66BB6A; // Green for empty table
            case "Đang dùng":
                return 0xFFFFA726; // Orange for occupied table
            default:
                return 0xFF9E9E9E; // Grey
        }
    }
    
    // Get status text in Vietnamese
    public static String getStatusText(String status) {
        if (status == null) return "Không xác định";
        
        switch (status.toLowerCase()) {
            case "pending":
            case "chưa làm":
                return "Chưa làm";
            case "preparing":
            case "đang chuẩn bị":
                return "Đang chuẩn bị";
            case "completed":
            case "hoàn tất":
                return "Hoàn tất";
            case "cancelled":
            case "đã hủy":
                return "Đã hủy";
            case "empty":
            case "trống":
                return "Trống";
            case "occupied":
            case "đang dùng":
                return "Đang dùng";
            default:
                return status;
        }
    }
}
