# User Favorites API Testing Guide

## Overview
This guide explains how to use the Postman collection to test the User Favorites endpoints in the RMS API Server.

## Postman Collection File
**File:** `User_Favorites_API_Tests.postman_collection.json`

## Import Instructions

1. **Open Postman**
2. **Click "Import" button** (top left)
3. **Select the collection JSON file** or drag and drop it
4. **Collection will appear** in your Collections sidebar

## Collection Variables

The collection uses the following variables (automatically set):

| Variable | Default Value | Description |
|----------|--------------|-------------|
| `base_url` | `http://46.250.231.129:8080` | API server base URL |
| `test_user_id` | `3292731962` | Valid user ID for testing |
| `test_food_id` | `1         ` | Valid food ID for testing (10 chars) |
| `created_favorite_id` | (auto-set) | ID of created favorite (saved during test) |

### Customizing Variables

To use different test data:

1. **Right-click the collection** → Select "Edit"
2. **Go to "Variables" tab**
3. **Update "Current Value" column** with your data
4. **Click "Save"**

**Important:** Food IDs are typically 10 characters (padded with spaces if needed).

## Test Sequence

The collection includes 10 requests designed to run in order:

### 1. Get User Favorites
- **Method:** GET
- **Endpoint:** `/api/UserFavorite/user/{userId}`
- **Purpose:** Retrieve all favorites for a user
- **Tests:**
  - Status code is 200
  - Response is JSON array
  - Items have correct structure
  - Saves foodId for later tests

### 2. Get Favorites for Non-Existent User
- **Method:** GET
- **Endpoint:** `/api/UserFavorite/user/999999999`
- **Purpose:** Test error handling for invalid user
- **Tests:**
  - Status code is 200
  - Response is empty array

### 3. Add Food to Favorites
- **Method:** POST
- **Endpoint:** `/api/UserFavorite`
- **Body:**
  ```json
  {
    "userId": "{{test_user_id}}",
    "foodId": "{{test_food_id}}"
  }
  ```
- **Purpose:** Add a new favorite
- **Tests:**
  - Status code is 201 Created
  - Response has userFavoriteId, userId, foodId, foodName, createdTime
  - Values match request
  - Success message is present
  - Saves userFavoriteId for later use

### 4. Add Duplicate Favorite (Should Fail)
- **Method:** POST
- **Endpoint:** `/api/UserFavorite`
- **Purpose:** Test duplicate prevention
- **Tests:**
  - Status code is 409 Conflict
  - Error message indicates duplicate

### 5. Add Favorite with Non-Existent User
- **Method:** POST
- **Endpoint:** `/api/UserFavorite`
- **Purpose:** Test user validation
- **Tests:**
  - Status code is 404 Not Found
  - Error message indicates user not found

### 6. Add Favorite with Non-Existent Food
- **Method:** POST
- **Endpoint:** `/api/UserFavorite`
- **Purpose:** Test food validation
- **Tests:**
  - Status code is 404 Not Found
  - Error message indicates food not found

### 7. Delete Favorite
- **Method:** DELETE
- **Endpoint:** `/api/UserFavorite/user/{userId}/food/{foodId}`
- **Purpose:** Remove a favorite
- **Tests:**
  - Status code is 200 OK
  - Success message with "removed successfully"

### 8. Delete Non-Existent Favorite
- **Method:** DELETE
- **Endpoint:** `/api/UserFavorite/user/{userId}/food/INVALID999`
- **Purpose:** Test delete error handling
- **Tests:**
  - Status code is 404 Not Found
  - Error message indicates favorite not found

### 9. Verify Favorite Was Deleted
- **Method:** GET
- **Endpoint:** `/api/UserFavorite/user/{userId}`
- **Purpose:** Confirm deletion worked
- **Tests:**
  - Status code is 200
  - Deleted food is not in the list

### 10. CORS Preflight Request
- **Method:** OPTIONS
- **Endpoint:** `/api/UserFavorite`
- **Purpose:** Test CORS configuration
- **Tests:**
  - Status code is 200 or 204
  - CORS headers are present

## Running the Tests

### Option 1: Run Individual Requests
1. **Select a request** from the collection
2. **Click "Send" button**
3. **View response** and test results in bottom panel

### Option 2: Run Entire Collection
1. **Right-click the collection** → Select "Run collection"
2. **Collection Runner window opens**
3. **Click "Run User Favorites API Tests" button**
4. **View all test results** in the runner

### Option 3: Automate with Newman (CLI)
```bash
# Install Newman (if not already installed)
npm install -g newman

# Run the collection
newman run User_Favorites_API_Tests.postman_collection.json

# Run with detailed output
newman run User_Favorites_API_Tests.postman_collection.json --reporters cli,json
```

## Expected Results

### All Tests Passing
When run in sequence with valid data:
- **10 requests** executed
- **30+ assertions** passed
- **0 failures**

### Test Summary
```
┌─────────────────────────┬──────────────────┬──────────────────┐
│                         │         executed │           failed │
├─────────────────────────┼──────────────────┼──────────────────┤
│              iterations │                1 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│                requests │               10 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│            test-scripts │               20 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│      prerequest-scripts │               11 │                0 │
├─────────────────────────┼──────────────────┼──────────────────┤
│              assertions │               30 │                0 │
└─────────────────────────┴──────────────────┴──────────────────┘
```

## Response Examples

### Successful GET Request
```json
[
  {
    "userFavoriteId": "UF12345678",
    "userId": "3292731962",
    "foodId": "1         ",
    "foodName": "Phở Bò",
    "foodImage": "pho_bo.jpg",
    "unitPrice": 45000,
    "createdTime": "2024-01-15T10:30:00"
  }
]
```

### Successful POST Request
```json
{
  "userFavoriteId": "UF12345678",
  "userId": "3292731962",
  "foodId": "1         ",
  "foodName": "Phở Bò",
  "foodImage": "pho_bo.jpg",
  "unitPrice": 45000,
  "createdTime": "2024-01-15T10:30:00",
  "message": "Food added to favorites successfully"
}
```

### Successful DELETE Request
```json
{
  "message": "Favorite removed successfully"
}
```

### Error Response (409 Conflict)
```json
{
  "message": "This food is already in your favorites"
}
```

### Error Response (404 Not Found)
```json
{
  "message": "User not found"
}
```

## Troubleshooting

### Issue: All tests failing with network error
**Solution:** Verify the API server is running at `http://46.250.231.129:8080`

### Issue: 404 errors for valid requests
**Solution:** 
- Check that `test_user_id` exists in the database
- Check that `test_food_id` exists in the database
- Verify Food ID is exactly 10 characters (padded with spaces)

### Issue: Test "Response has correct structure" failing
**Solution:** User might not have any favorites yet. Run the "Add Food to Favorites" request first.

### Issue: Duplicate error when running collection multiple times
**Solution:** This is expected behavior. The first run adds the favorite, subsequent runs fail at step 3. Either:
- Delete the favorite manually first
- Skip request #3 on subsequent runs
- Use different `test_food_id` values

### Issue: CORS test failing
**Solution:** 
- Verify CORS is configured in `Program.cs`
- Check that `Access-Control-Allow-Origin` header is set
- Ensure OPTIONS endpoint is implemented in controller

## Database Setup

Before running tests, ensure you have:

1. **Users table** with at least one user (default: ID `3292731962`)
2. **Food table** with at least one food item (default: ID `1         `)
3. **UserFavorite table** created with proper schema

### Create Test Data SQL
```sql
-- Insert test user (if not exists)
IF NOT EXISTS (SELECT 1 FROM [User] WHERE UserId = '3292731962')
BEGIN
    INSERT INTO [User] (UserId, Name, Phone, Email)
    VALUES ('3292731962', 'Test User', '0123456789', 'test@example.com');
END

-- Insert test food (if not exists)
IF NOT EXISTS (SELECT 1 FROM Food WHERE FoodId = '1         ')
BEGIN
    INSERT INTO Food (FoodId, Name, UnitPrice, Image)
    VALUES ('1         ', 'Phở Bò', 45000, 'pho_bo.jpg');
END

-- Clean up test favorites
DELETE FROM UserFavorite 
WHERE UserId = '3292731962' AND FoodId = '1         ';
```

## API Endpoint Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/UserFavorite/user/{userId}` | Get user's favorites |
| POST | `/api/UserFavorite` | Add food to favorites |
| DELETE | `/api/UserFavorite/user/{userId}/food/{foodId}` | Remove favorite |
| OPTIONS | `/api/UserFavorite` | CORS preflight |

## Integration with Mobile App

These endpoints are used in the RMS Mobile app:

- **FavoritesScreen.js** → GET user favorites
- **FoodDetailScreen.js** → POST add favorite, DELETE remove favorite
- **Heart icon buttons** → Toggle favorite status

## Next Steps

1. **Import the collection** into Postman
2. **Verify variables** match your test data
3. **Run the collection** using Collection Runner
4. **Review test results** and fix any failures
5. **Integrate with CI/CD** using Newman (optional)

## Related Files

- **Controller:** `Controllers/UserFavoriteController.cs`
- **Model:** `Models/UserFavorite.cs`
- **DTO:** `Models/CreateUserFavoriteDto.cs`
- **Database Script:** `create_auxiliary_tables.sql`
- **Postman Collection:** `User_Favorites_API_Tests.postman_collection.json`

## Support

If you encounter issues:
1. Check API server logs for detailed error messages
2. Verify database connection is working
3. Ensure all required tables exist
4. Confirm test data (user and food) exists in database
5. Review CORS configuration if cross-origin errors occur

---

**Last Updated:** January 2024  
**API Version:** 1.0  
**Postman Collection Version:** 1.0
