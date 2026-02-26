# Bill Manager Screen Setup

## Overview
A new **Bill Manager Screen** has been created that allows you to:
- ✅ View all completed orders ready for billing
- ✅ Create bills from completed orders
- ✅ Edit bill details (discount, payment method)
- ✅ Change bill payment status
- ✅ Print bills (PDF export on mobile, print on web)

## Installation Steps

### 1. Install Required Dependencies

The Bill Manager screen requires two additional Expo packages for printing functionality:

```bash
npx expo install expo-print expo-sharing
```

### 2. Files Added/Modified

#### New Files:
- `screens/BillManagerScreen.js` - Main bill management screen

#### Modified Files:
- `App.js` - Added navigation for BillManager screen
- `context/AuthContext.js` - Added BillManager to menu items and permissions

### 3. Role-Based Access

The Bill Manager screen is accessible to users with the **TN (Thanh Nien/Cashier)** role:
- TN role can access: Home, Orders, Bill, BillManager, Profile
- Admin role has access to all screens

### 4. Features

#### Tab 1: Completed Orders
- Shows all orders with status "Hoàn tất" (Complete) that don't have bills yet
- Displays order details: Order ID, Table, Date, Total Amount
- "Create Bill" button for each order

#### Tab 2: Bills
- Shows all created bills
- Displays bill details: Bill ID, Order ID, Payment Method, Amount, Discount
- Action buttons:
  - **Edit**: Change payment method and discount
  - **Print**: Generate and share/print bill PDF

#### Create Bill Modal
- Enter discount amount
- Select payment method:
  - Cash (Tiền mặt)
  - Credit Card (Thẻ tín dụng)
  - Bank Transfer (Chuyển khoản)
  - E-Wallet (Ví điện tử)
  - Unpaid (Chưa thanh toán)
- Shows real-time calculation of final total
- Creates bill and bill details in database
- Updates order status to "Đã tạo bill"

#### Edit Bill Modal
- Update discount amount
- Change payment method
- Recalculates final total
- Updates bill in database

#### Print Bill
- Generates professional receipt format
- Includes:
  - Restaurant header
  - Bill and Order IDs
  - Date and payment method
  - Itemized list with quantities and prices
  - Subtotal, discount, and final total
  - Thank you message
- On mobile: Creates PDF and opens share sheet
- On web: Opens print dialog

### 5. API Endpoints Used

The screen uses the following API endpoints:
- `GET /api/Order` - Fetch all orders
- `GET /api/Order/{orderId}` - Get order details
- `GET /api/OrderDetail/order/{orderId}` - Get order items
- `POST /api/Order/{orderId}` - Update order status
- `GET /api/Bill` - Fetch all bills
- `POST /api/Bill` - Create new bill
- `PUT /api/Bill/{billId}` - Update bill
- `GET /api/BillDetail/bill/{billId}` - Get bill details
- `POST /api/BillDetail` - Create bill detail
- `GET /api/FoodItem/{foodId}` - Get food item details

### 6. Navigation

The screen can be accessed from the sidebar menu:
- Look for "Bill Management" in the main menu (TN/Admin roles only)
- Icon: cash-register
- Screen name: `BillManager`

### 7. Testing

To test the Bill Manager screen:

1. **Login as TN role** or Admin
2. Navigate to **Bill Management** from the sidebar
3. **Create a completed order** first (if none exist):
   - Go to Orders
   - Ensure an order has status "Hoàn tất"
4. Switch to **Completed Orders** tab in Bill Manager
5. Click **Create Bill** on an order
6. Fill in discount and payment method
7. Click **Create Bill**
8. Switch to **Bills** tab to see the created bill
9. Click **Edit** to modify bill details
10. Click **Print** to generate and share/print the bill

### 8. Database Schema

The screen works with these tables:
- `[Bill]` - Stores bill information
- `[Bill_Detail]` - Stores bill line items
- `[Order]` - Orders that can be billed
- `[OrderDetail]` - Order line items
- `[FoodItem]` - Food information for bill printing

### 9. Troubleshooting

**Issue: Print functionality not working**
- Ensure expo-print and expo-sharing are installed
- On mobile, ensure storage permissions are granted
- On web, ensure pop-ups are not blocked

**Issue: No completed orders showing**
- Ensure orders have status "Hoàn tất" or "complete"
- Check that orders haven't already been billed

**Issue: Screen not accessible**
- Check user role (must be TN or Admin)
- Verify AuthContext permissions are configured correctly

**Issue: Bill creation fails**
- Check API server is running
- Verify all required fields are provided
- Check browser console for error messages

### 10. Future Enhancements

Potential improvements for the Bill Manager:
- Add bill search and filter functionality
- Export bills to Excel/CSV
- Email bill to customer
- QR code for digital payments
- Bill templates customization
- Multi-currency support
- Tax calculation
- Tips handling
- Split bill functionality
- Batch bill printing

---

## Quick Start Commands

```bash
# Navigate to project directory
cd RMSMobile/Restaurant-Manangment-System-RMSMobile-Testing

# Install dependencies
npx expo install expo-print expo-sharing

# Start the app
npm start

# Or run on specific platform
npm run android
npm run ios
npm run web
```

## Support

For issues or questions:
1. Check the console logs for error messages
2. Verify API server is running and accessible
3. Ensure user has correct role permissions
4. Check database tables for correct data structure
