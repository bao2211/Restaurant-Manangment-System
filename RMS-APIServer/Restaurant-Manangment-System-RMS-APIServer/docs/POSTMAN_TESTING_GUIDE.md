# Restaurant Management System - Auxiliary Features API Testing Guide

## Overview
This Postman collection provides comprehensive testing for all auxiliary features APIs including:
- **User Favorites** - Managing user's favorite food items
- **Order History** - Tracking user's order history
- **Table Reservation History** - Managing table reservations and history

## Quick Setup

### 1. Import Collection
1. Open Postman
2. Click "Import" button
3. Select the `Auxiliary_Features_API_Tests.postman_collection.json` file
4. The collection will be imported with all tests and variables

### 2. Configure Environment Variables
The collection includes these variables that you can modify:

| Variable | Default Value | Description |
|----------|---------------|-------------|
| `base_url` | `http://46.250.231.129:8080` | Production server URL |
| `local_base_url` | `http://localhost:8080` | Local development server URL |
| `auth_token` | (auto-set) | JWT authentication token |
| `test_user_id` | `U001` | User ID for testing (update to match your database) |
| `test_food_id` | `F001` | Food ID for testing (update to match your database) |
| `test_order_id` | `O001` | Order ID for testing (update to match your database) |
| `test_table_id` | `T001` | Table ID for testing (update to match your database) |

### 3. Update Test Data IDs
Before running tests, update these variables with valid IDs from your database:

```javascript
// Right-click on collection > Edit > Variables tab
test_user_id: "your_actual_user_id"     // e.g., "U001234567"
test_food_id: "your_actual_food_id"     // e.g., "F001234567" 
test_order_id: "your_actual_order_id"   // e.g., "O001234567"
test_table_id: "your_actual_table_id"   // e.g., "T001234567"
```

## Test Structure

### 0. Authentication
- **Login to get Auth Token** - Must run this first to get JWT token for other requests

### 1. User Favorites API (6 tests)
- Get empty favorites list
- Add food to favorites
- Get favorites with data
- Check favorite status (true)
- Remove food from favorites
- Check favorite status (false)

### 2. Order History API (4 tests)
- Get empty order history
- Create order history entry
- Get order history with data
- Get specific order history by ID

### 3. Table Reservation History API (7 tests)
- Get empty reservation history
- Create new table reservation
- Get reservation history with data
- Get specific reservation by ID
- Cancel reservation
- Verify cancelled reservation status

### 4. Error Handling Tests (4 tests)
- Unauthorized access without token
- Invalid food ID handling
- Invalid order ID handling
- Invalid table ID handling

## Running Tests

### Option 1: Run Entire Collection
1. Right-click on collection name
2. Select "Run collection"
3. Click "Run Restaurant Management System - Auxiliary Features API Tests"
4. View results in test runner

### Option 2: Run Individual Folders
1. Right-click on any folder (e.g., "1. User Favorites API")
2. Select "Run folder"
3. View results for that specific API group

### Option 3: Run Single Tests
1. Click on individual request
2. Click "Send" button
3. View response and test results in bottom panel

## Expected Results

### Successful Test Run
- **Authentication**: 1 test passed - JWT token obtained
- **User Favorites**: 6 tests passed - Complete CRUD operations
- **Order History**: 4 tests passed - Create and retrieve operations
- **Table Reservations**: 7 tests passed - Full reservation lifecycle
- **Error Handling**: 4 tests passed - Proper error responses

### Test Validations
Each test validates:
- ✅ HTTP status codes (200, 400, 401)
- ✅ Response structure and required properties
- ✅ Data type validations
- ✅ Business logic correctness
- ✅ Response time performance (< 1-2 seconds)
- ✅ Authentication requirements
- ✅ Error message formats

## API Endpoints Tested

### Favorites API
```
GET    /api/Favorites                    - Get user favorites
POST   /api/Favorites/{foodId}          - Add to favorites
DELETE /api/Favorites/{foodId}          - Remove from favorites
GET    /api/Favorites/{foodId}/status   - Check favorite status
```

### Order History API
```
GET    /api/OrderHistory               - Get paginated order history
POST   /api/OrderHistory               - Create order history entry
GET    /api/OrderHistory/{id}          - Get specific order history
```

### Reservation History API
```
GET    /api/ReservationHistory         - Get paginated reservation history
POST   /api/ReservationHistory         - Create new reservation
GET    /api/ReservationHistory/{id}    - Get specific reservation
PUT    /api/ReservationHistory/{id}/cancel - Cancel reservation
```

## Troubleshooting

### Common Issues

1. **401 Unauthorized Error**
   - Solution: Run "Login to get Auth Token" test first
   - Verify username/password in login request

2. **404 Not Found Error**
   - Solution: Ensure API server is running on correct port
   - Check `base_url` variable matches your server

3. **400 Bad Request with Invalid ID**
   - Solution: Update test variables with actual IDs from your database
   - Check database for valid User, Food, Order, and Table IDs

4. **Connection Refused Error**
   - Solution: Start the API server using `dotnet run`
   - Verify server is running on port 8080

### Database Verification
Run these SQL queries to get valid test IDs:

```sql
-- Get valid User ID
SELECT TOP 1 UserId FROM [User] WHERE UserName IS NOT NULL;

-- Get valid Food ID  
SELECT TOP 1 FoodId FROM [Food_Info] WHERE FoodName IS NOT NULL;

-- Get valid Order ID
SELECT TOP 1 OrderId FROM [Order] WHERE OrderId IS NOT NULL;

-- Get valid Table ID
SELECT TOP 1 TableId FROM [Table] WHERE TableId IS NOT NULL;
```

## Test Data Management

### Automatic Cleanup
The collection automatically:
- Stores created IDs in variables for subsequent tests
- Tests removal/cancellation operations
- Cleans up test data where possible

### Manual Cleanup
If needed, manually clean test data:

```sql
-- Clean favorites (replace with actual user ID)
DELETE FROM UserFavorites WHERE UserId = 'YOUR_USER_ID';

-- Clean order history (replace with actual user ID)  
DELETE FROM OrderHistory WHERE UserId = 'YOUR_USER_ID';

-- Clean reservation history (replace with actual user ID)
DELETE FROM TableReservationHistory WHERE UserId = 'YOUR_USER_ID';
```

## Advanced Usage

### Environment Switching
1. Duplicate collection variables
2. Create separate environments for:
   - Local Development (`http://localhost:8080`)
   - Staging Server
   - Production Server (`http://46.250.231.129:8080`)

### Continuous Integration
Export and use with Newman (Postman CLI):

```bash
npm install -g newman
newman run Auxiliary_Features_API_Tests.postman_collection.json
```

### Custom Test Scripts
Modify test scripts to add additional validations:

```javascript
pm.test("Custom validation", function () {
    var jsonData = pm.response.json();
    // Add your custom assertions here
    pm.expect(jsonData.customProperty).to.equal("expected_value");
});
```

## Success Criteria
✅ All 22 tests pass  
✅ Authentication flow works correctly  
✅ CRUD operations function properly  
✅ Error handling is appropriate  
✅ Response times are acceptable  
✅ Data validation is working  

## Support
If you encounter issues:
1. Check API server logs for errors
2. Verify database connection and table existence
3. Ensure all auxiliary tables are properly created
4. Review API endpoint implementations
5. Check CORS configuration for cross-origin requests

---
*Generated for Restaurant Management System Auxiliary Features*  
*Last Updated: November 2024*