package com.example.rmsandroid.activities;

import android.app.DatePickerDialog;
import android.app.TimePickerDialog;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.CheckBox;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ProgressBar;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.example.rmsandroid.R;
import com.example.rmsandroid.api.ApiService;
import com.example.rmsandroid.api.RetrofitClient;
import com.example.rmsandroid.models.CartItem;
import com.example.rmsandroid.models.Order;
import com.example.rmsandroid.models.OrderDetail;
import com.example.rmsandroid.models.TableInfo;
import com.example.rmsandroid.utils.CartManager;
import com.example.rmsandroid.utils.FormatUtils;
import com.example.rmsandroid.utils.SessionManager;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;

public class CheckoutActivity extends AppCompatActivity {
    
    private EditText etFullName, etPhone, etAddress, etNote;
    private EditText etReservationDate, etReservationTime;
    private TextView tvOrderSummary, tvTotal;
    private Button btnPlaceOrder;
    private ProgressBar progressBar;
    private CheckBox cbReserveTable;
    private LinearLayout layoutTableSelection;
    private Spinner spinnerTable;
    private Button btnPaymentCash, btnPaymentCard, btnPaymentTransfer, btnPaymentWallet, btnPaymentUnpaid;
    
    private CartManager cartManager;
    private SessionManager sessionManager;
    private ApiService apiService;
    
    private List<TableInfo> availableTables = new ArrayList<>();
    private TableInfo selectedTable = null;
    private Calendar selectedDateTime = Calendar.getInstance();
    private String selectedPaymentMethod = "Tiền mặt"; // Default payment method
    
    private static final int ONLINE_TABLE_ID = 8; // Table ID for online orders
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_checkout);
        
        initViews();
        loadUserInfo();
        loadOrderSummary();
        
        btnPlaceOrder.setOnClickListener(v -> placeOrder());
    }
    
    private void initViews() {
        etFullName = findViewById(R.id.et_full_name);
        etPhone = findViewById(R.id.et_phone);
        etAddress = findViewById(R.id.et_address);
        etNote = findViewById(R.id.et_note);
        etReservationDate = findViewById(R.id.et_reservation_date);
        etReservationTime = findViewById(R.id.et_reservation_time);
        tvOrderSummary = findViewById(R.id.tv_order_summary);
        tvTotal = findViewById(R.id.tv_total);
        btnPlaceOrder = findViewById(R.id.btn_place_order);
        progressBar = findViewById(R.id.progress_bar);
        cbReserveTable = findViewById(R.id.cb_reserve_table);
        layoutTableSelection = findViewById(R.id.layout_table_selection);
        spinnerTable = findViewById(R.id.spinner_table);
        
        // Payment method buttons
        btnPaymentCash = findViewById(R.id.btn_payment_cash);
        btnPaymentCard = findViewById(R.id.btn_payment_card);
        btnPaymentTransfer = findViewById(R.id.btn_payment_transfer);
        btnPaymentWallet = findViewById(R.id.btn_payment_wallet);
        btnPaymentUnpaid = findViewById(R.id.btn_payment_unpaid);
        
        cartManager = new CartManager(this);
        sessionManager = new SessionManager(this);
        apiService = RetrofitClient.getApiService();
        
        setupTableReservation();
        setupPaymentMethods();
    }
    
    private void setupTableReservation() {
        // Toggle table selection visibility
        cbReserveTable.setOnCheckedChangeListener((buttonView, isChecked) -> {
            if (isChecked) {
                layoutTableSelection.setVisibility(View.VISIBLE);
                // Hide address field, show table selection
                findViewById(R.id.layout_address).setVisibility(View.GONE);
                loadAvailableTables();
            } else {
                layoutTableSelection.setVisibility(View.GONE);
                findViewById(R.id.layout_address).setVisibility(View.VISIBLE);
                selectedTable = null;
            }
        });
        
        // Date picker
        etReservationDate.setOnClickListener(v -> showDatePicker());
        
        // Time picker
        etReservationTime.setOnClickListener(v -> showTimePicker());
        
        // Table selection
        spinnerTable.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                if (position > 0 && position <= availableTables.size()) {
                    selectedTable = availableTables.get(position - 1);
                } else {
                    selectedTable = null;
                }
            }
            
            @Override
            public void onNothingSelected(AdapterView<?> parent) {
                selectedTable = null;
            }
        });
    }
    
    private void setupPaymentMethods() {
        // Set cash as default (already selected)
        updatePaymentButtonSelection(btnPaymentCash);
        
        btnPaymentCash.setOnClickListener(v -> {
            selectedPaymentMethod = "Tiền mặt";
            updatePaymentButtonSelection(btnPaymentCash);
        });
        
        btnPaymentCard.setOnClickListener(v -> {
            selectedPaymentMethod = "Thẻ tín dụng";
            updatePaymentButtonSelection(btnPaymentCard);
        });
        
        btnPaymentTransfer.setOnClickListener(v -> {
            selectedPaymentMethod = "Chuyển khoản";
            updatePaymentButtonSelection(btnPaymentTransfer);
        });
        
        btnPaymentWallet.setOnClickListener(v -> {
            selectedPaymentMethod = "Ví điện tử";
            updatePaymentButtonSelection(btnPaymentWallet);
        });
        
        btnPaymentUnpaid.setOnClickListener(v -> {
            selectedPaymentMethod = "Chưa thanh toán";
            updatePaymentButtonSelection(btnPaymentUnpaid);
        });
    }
    
    private void updatePaymentButtonSelection(Button selectedButton) {
        // Reset all buttons to unselected state
        resetPaymentButton(btnPaymentCash);
        resetPaymentButton(btnPaymentCard);
        resetPaymentButton(btnPaymentTransfer);
        resetPaymentButton(btnPaymentWallet);
        resetPaymentButton(btnPaymentUnpaid);
        
        // Highlight selected button
        selectedButton.setBackgroundColor(getResources().getColor(android.R.color.holo_orange_light));
        selectedButton.setTextColor(getResources().getColor(android.R.color.white));
    }
    
    private void resetPaymentButton(Button button) {
        button.setBackgroundColor(getResources().getColor(android.R.color.transparent));
        button.setTextColor(getResources().getColor(android.R.color.black));
    }
    
    private void loadAvailableTables() {
        apiService.getAllTables().enqueue(new Callback<List<TableInfo>>() {
            @Override
            public void onResponse(Call<List<TableInfo>> call, Response<List<TableInfo>> response) {
                if (response.isSuccessful() && response.body() != null) {
                    availableTables.clear();
                    // Filter out online table (table 8) and only show available tables
                    for (TableInfo table : response.body()) {
                        String tableId = table.getTableId().trim();
                        if (!tableId.equals("8") && "Available".equalsIgnoreCase(table.getStatus())) {
                            availableTables.add(table);
                        }
                    }
                    setupTableSpinner();
                }
            }
            
            @Override
            public void onFailure(Call<List<TableInfo>> call, Throwable t) {
                Toast.makeText(CheckoutActivity.this, 
                    "Không thể tải danh sách bàn", Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    private void setupTableSpinner() {
        List<String> tableNames = new ArrayList<>();
        tableNames.add("-- Chọn bàn --");
        for (TableInfo table : availableTables) {
            tableNames.add(table.getTableName() + " (" + table.getNumOfSeats() + " chỗ)");
        }
        
        ArrayAdapter<String> adapter = new ArrayAdapter<>(
            this, 
            android.R.layout.simple_spinner_item, 
            tableNames
        );
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
        spinnerTable.setAdapter(adapter);
    }
    
    private void showDatePicker() {
        Calendar calendar = Calendar.getInstance();
        DatePickerDialog datePickerDialog = new DatePickerDialog(
            this,
            (view, year, month, dayOfMonth) -> {
                selectedDateTime.set(Calendar.YEAR, year);
                selectedDateTime.set(Calendar.MONTH, month);
                selectedDateTime.set(Calendar.DAY_OF_MONTH, dayOfMonth);
                updateDateDisplay();
            },
            calendar.get(Calendar.YEAR),
            calendar.get(Calendar.MONTH),
            calendar.get(Calendar.DAY_OF_MONTH)
        );
        datePickerDialog.getDatePicker().setMinDate(System.currentTimeMillis());
        datePickerDialog.show();
    }
    
    private void showTimePicker() {
        Calendar calendar = Calendar.getInstance();
        TimePickerDialog timePickerDialog = new TimePickerDialog(
            this,
            (view, hourOfDay, minute) -> {
                selectedDateTime.set(Calendar.HOUR_OF_DAY, hourOfDay);
                selectedDateTime.set(Calendar.MINUTE, minute);
                updateTimeDisplay();
            },
            calendar.get(Calendar.HOUR_OF_DAY),
            calendar.get(Calendar.MINUTE),
            true
        );
        timePickerDialog.show();
    }
    
    private void updateDateDisplay() {
        SimpleDateFormat sdf = new SimpleDateFormat("dd/MM/yyyy", Locale.getDefault());
        etReservationDate.setText(sdf.format(selectedDateTime.getTime()));
    }
    
    private void updateTimeDisplay() {
        SimpleDateFormat sdf = new SimpleDateFormat("HH:mm", Locale.getDefault());
        etReservationTime.setText(sdf.format(selectedDateTime.getTime()));
    }
    
    private void loadUserInfo() {
        // Pre-fill with user info if available
        if (sessionManager.getUser() != null) {
            String fullName = sessionManager.getUser().getFullName();
            String phone = sessionManager.getUser().getPhone();
            
            if (fullName != null && !fullName.isEmpty()) {
                etFullName.setText(fullName);
            }
            if (phone != null && !phone.isEmpty()) {
                etPhone.setText(phone);
            }
        }
    }
    
    private void loadOrderSummary() {
        List<CartItem> cartItems = cartManager.getCart();
        int totalItems = 0;
        double total = 0;
        
        StringBuilder summary = new StringBuilder();
        for (CartItem item : cartItems) {
            totalItems += item.getQuantity();
            total += item.getSubtotal();
            summary.append(item.getFood().getFoodName())
                    .append(" x")
                    .append(item.getQuantity())
                    .append("\n");
        }
        
        tvOrderSummary.setText(totalItems + " món:\n" + summary.toString());
        tvTotal.setText(FormatUtils.formatPrice(total));
    }
    
    private void placeOrder() {
        // Validation
        String fullName = etFullName.getText().toString().trim();
        String phone = etPhone.getText().toString().trim();
        String note = etNote.getText().toString().trim();
        boolean isReservation = cbReserveTable.isChecked();
        
        if (fullName.isEmpty()) {
            etFullName.setError("Vui lòng nhập họ tên");
            etFullName.requestFocus();
            return;
        }
        
        if (phone.isEmpty()) {
            etPhone.setError("Vui lòng nhập số điện thoại");
            etPhone.requestFocus();
            return;
        }
        
        String tableId;
        String orderNote;
        
        if (isReservation) {
            // Table reservation validation
            if (selectedTable == null) {
                Toast.makeText(this, "Vui lòng chọn bàn", Toast.LENGTH_SHORT).show();
                return;
            }
            
            String reservationDate = etReservationDate.getText().toString().trim();
            String reservationTime = etReservationTime.getText().toString().trim();
            
            if (reservationDate.isEmpty()) {
                etReservationDate.setError("Vui lòng chọn ngày");
                etReservationDate.requestFocus();
                return;
            }
            
            if (reservationTime.isEmpty()) {
                etReservationTime.setError("Vui lòng chọn giờ");
                etReservationTime.requestFocus();
                return;
            }
            
            // Build reservation note
            StringBuilder noteBuilder = new StringBuilder();
            noteBuilder.append("=== ĐẶT BÀN ===\n");
            noteBuilder.append("Khách hàng: ").append(fullName).append("\n");
            noteBuilder.append("SĐT: ").append(phone).append("\n");
            noteBuilder.append("Bàn: ").append(selectedTable.getTableName()).append("\n");
            noteBuilder.append("Ngày: ").append(reservationDate).append("\n");
            noteBuilder.append("Giờ: ").append(reservationTime).append("\n");
            noteBuilder.append("Thanh toán: ").append(selectedPaymentMethod);
            
            if (!note.isEmpty()) {
                noteBuilder.append("\nGhi chú: ").append(note);
            }
            
            tableId = selectedTable.getTableId().trim();
            orderNote = noteBuilder.toString();
        } else {
            // Online order validation
            String address = etAddress.getText().toString().trim();
            
            if (address.isEmpty()) {
                etAddress.setError("Vui lòng nhập địa chỉ giao hàng");
                etAddress.requestFocus();
                return;
            }
            
            // Build online order note
            StringBuilder noteBuilder = new StringBuilder();
            noteBuilder.append("=== ĐƠN HÀNG ONLINE ===\n");
            noteBuilder.append("Khách hàng: ").append(fullName).append("\n");
            noteBuilder.append("SĐT: ").append(phone).append("\n");
            noteBuilder.append("Địa chỉ: ").append(address).append("\n");
            noteBuilder.append("Thanh toán: ").append(selectedPaymentMethod);
            
            if (!note.isEmpty()) {
                noteBuilder.append("\nGhi chú: ").append(note);
            }
            
            tableId = String.valueOf(ONLINE_TABLE_ID); // Table 8 for online orders
            orderNote = noteBuilder.toString();
        }
        
        // Generate order ID
        String orderId = generateOrderId();
        
        // Create order
        Order order = new Order();
        order.setOrderId(orderId);
        order.setUserId(sessionManager.getUser().getUserId());
        order.setTableId(tableId);
        order.setTotal(cartManager.getCartTotal());
        order.setDiscount(0.0);
        order.setNote(orderNote);
        order.setStatus("Chưa làm");
        order.setCreatedTime(new SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).format(new Date()));
        
        // Set reservationId for table reservations
        if (isReservation) {
            order.setReservationId(tableId); // Store selected table ID in reservationId
        }
        
        // Get cart items for creating order details
        final List<CartItem> cartItems = cartManager.getCart();
        
        // Show loading
        progressBar.setVisibility(View.VISIBLE);
        btnPlaceOrder.setEnabled(false);
        
        // Submit order
        apiService.createOrder(order).enqueue(new Callback<Order>() {
            @Override
            public void onResponse(Call<Order> call, Response<Order> response) {
                if (response.isSuccessful() && response.body() != null) {
                    // Order created successfully, now create order details
                    String createdOrderId = response.body().getOrderId();
                    createOrderDetails(createdOrderId, cartItems);
                } else {
                    progressBar.setVisibility(View.GONE);
                    btnPlaceOrder.setEnabled(true);
                    Toast.makeText(CheckoutActivity.this, 
                        "Không thể đặt hàng. Vui lòng thử lại.", 
                        Toast.LENGTH_SHORT).show();
                }
            }
            
            @Override
            public void onFailure(Call<Order> call, Throwable t) {
                progressBar.setVisibility(View.GONE);
                btnPlaceOrder.setEnabled(true);
                Toast.makeText(CheckoutActivity.this, 
                    "Lỗi kết nối: " + t.getMessage(), 
                    Toast.LENGTH_SHORT).show();
            }
        });
    }
    
    // Generate order ID similar to React Native (ORD + 7 digit timestamp)
    private String generateOrderId() {
        long timestamp = System.currentTimeMillis();
        String orderNumber = String.valueOf(timestamp).substring(String.valueOf(timestamp).length() - 7);
        return "ORD" + orderNumber;
    }
    
    // Create order details for each cart item SEQUENTIALLY (similar to React Native logic)
    private void createOrderDetails(String orderId, List<CartItem> cartItems) {
        final int totalItems = cartItems.size();
        final int[] successCount = {0};
        final int[] failureCount = {0};
        
        android.util.Log.d("CheckoutActivity", "=== CREATING ORDER DETAILS SEQUENTIALLY ===");
        android.util.Log.d("CheckoutActivity", "Order ID: " + orderId);
        android.util.Log.d("CheckoutActivity", "Total items to create: " + totalItems);
        
        // Start creating the first item
        createOrderDetailSequentially(orderId, cartItems, 0, successCount, failureCount);
    }
    
    // Create order details one at a time to avoid database connection issues
    private void createOrderDetailSequentially(String orderId, List<CartItem> cartItems, 
                                              int currentIndex, int[] successCount, int[] failureCount) {
        if (currentIndex >= cartItems.size()) {
            // All items processed
            onOrderDetailsComplete(orderId, successCount[0], failureCount[0]);
            return;
        }
        
        CartItem item = cartItems.get(currentIndex);
        final int itemIndex = currentIndex + 1;
        final int totalItems = cartItems.size();
        
        OrderDetail orderDetail = new OrderDetail();
        orderDetail.setOrderId(orderId.trim()); // Trim whitespace
        orderDetail.setFoodId(item.getFood().getFoodId().trim()); // Trim whitespace
        orderDetail.setQuantity(item.getQuantity());
        orderDetail.setUnitPrice(item.getFood().getUnitPrice());
        orderDetail.setStatus("Chưa làm"); // Default status
        
        android.util.Log.d("CheckoutActivity", "Creating detail " + itemIndex + "/" + totalItems);
        android.util.Log.d("CheckoutActivity", "  Food ID: '" + orderDetail.getFoodId() + "' (length: " + orderDetail.getFoodId().length() + ")");
        android.util.Log.d("CheckoutActivity", "  Food Name: " + item.getFood().getFoodName());
        android.util.Log.d("CheckoutActivity", "  Quantity: " + orderDetail.getQuantity());
        android.util.Log.d("CheckoutActivity", "  Unit Price: " + orderDetail.getUnitPrice());
        
        apiService.createOrderDetail(orderDetail).enqueue(new Callback<OrderDetail>() {
            @Override
            public void onResponse(Call<OrderDetail> call, Response<OrderDetail> response) {
                if (response.isSuccessful()) {
                    successCount[0]++;
                    android.util.Log.d("CheckoutActivity", "✓ Order detail " + itemIndex + " created successfully");
                } else {
                    failureCount[0]++;
                    android.util.Log.e("CheckoutActivity", "✗ Order detail " + itemIndex + " failed");
                    android.util.Log.e("CheckoutActivity", "  Response code: " + response.code());
                    android.util.Log.e("CheckoutActivity", "  Response message: " + response.message());
                    try {
                        if (response.errorBody() != null) {
                            android.util.Log.e("CheckoutActivity", "  Error body: " + response.errorBody().string());
                        }
                    } catch (Exception e) {
                        android.util.Log.e("CheckoutActivity", "  Could not read error body", e);
                    }
                }
                
                // Move to next item
                createOrderDetailSequentially(orderId, cartItems, currentIndex + 1, successCount, failureCount);
            }
            
            @Override
            public void onFailure(Call<OrderDetail> call, Throwable t) {
                failureCount[0]++;
                android.util.Log.e("CheckoutActivity", "✗ Order detail " + itemIndex + " failed with exception");
                android.util.Log.e("CheckoutActivity", "  Error: " + t.getMessage(), t);
                
                // Move to next item anyway
                createOrderDetailSequentially(orderId, cartItems, currentIndex + 1, successCount, failureCount);
            }
        });
    }
    
    // Handle completion of order detail creation
    private void onOrderDetailsComplete(String orderId, int successCount, int failureCount) {
        progressBar.setVisibility(View.GONE);
        btnPlaceOrder.setEnabled(true);
        
        // Clear cart
        cartManager.clearCart();
        
        // Show result message
        String message;
        boolean isReservation = cbReserveTable.isChecked();
        
        if (failureCount == 0) {
            if (isReservation) {
                message = "Đặt bàn thành công! Mã đơn #" + orderId + 
                         "\nBàn: " + (selectedTable != null ? selectedTable.getTableName() : "") +
                         "\nVui lòng đến đúng giờ đã đặt.";
            } else {
                message = "Đặt hàng thành công! Đơn hàng #" + orderId + 
                         "\nChúng tôi sẽ liên hệ để xác nhận và giao hàng.";
            }
        } else {
            message = "Đơn hàng đã tạo (#" + orderId + ") nhưng có " + failureCount + 
                     " món không thể thêm vào. Vui lòng kiểm tra lại.";
        }
        
        Toast.makeText(CheckoutActivity.this, message, Toast.LENGTH_LONG).show();
        
        // Go back to main activity
        Intent intent = new Intent(CheckoutActivity.this, MainActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        startActivity(intent);
        finish();
    }
}
