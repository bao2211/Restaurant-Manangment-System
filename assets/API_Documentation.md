# RMS API Server - Complete API Documentation

Base URL: `http://localhost:8080` (Docker) or `http://localhost:5181` (Local)
Base URL (HTTPS): `https://localhost:8081` (Docker) or `https://localhost:7127` (Local)

## ⚡ **API IMPROVEMENTS & CHANGES**

### **✅ Recent Updates (September 2025)**

- **Eliminated Circular References**: All API endpoints now return clean data without `$ref` objects
- **DTO Pattern Implementation**: Controllers use Data Transfer Objects for cleaner responses
- **JSON Serialization Optimization**: Removed `ReferenceHandler.Preserve` to prevent circular references
- **Improved Performance**: Faster API responses with optimized data structures
- **Better Mobile App Integration**: Consistent data format across all endpoints

### **🔧 Breaking Changes**

- API responses no longer contain `$ref` circular reference objects
- All endpoints now return simplified, clean data structures
- Category and related entity information is flattened for better consumption

## Authentication

- **Login Endpoint**: `POST /api/User/login`
- Most endpoints require no authentication (open API)

---

## 🍽️ **USER MANAGEMENT**

### 1. Get All Users

- **Endpoint**: `GET /api/User`
- **Description**: Retrieve all users
- **Response**: Array of User objects

**Example Request:**

```http
GET /api/User
```

**Example Response:**

```json
[
  {
    "userId": "U001",
    "userName": "admin",
    "password": "admin123",
    "role": "Admin",
    "right": "Full",
    "fullName": "John Administrator",
    "phone": 1234567890,
    "email": "admin@restaurant.com"
  }
]
```

### 2. Get User by ID

- **Endpoint**: `GET /api/User/{id}`
- **Description**: Retrieve a specific user by ID
- **Parameters**:
  - `id` (string): User ID

**Example Request:**

```http
GET /api/User/U001
```

### 3. Get User by Username

- **Endpoint**: `GET /api/User/username/{username}`
- **Description**: Retrieve user by username
- **Parameters**:
  - `username` (string): Username

**Example Request:**

```http
GET /api/User/username/admin
```

### 4. User Login

- **Endpoint**: `POST /api/User/login`
- **Description**: Authenticate user
- **Request Body**: LoginRequest object

**Example Request:**

```http
POST /api/User/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Example Response:**

```json
{
  "userId": "U001",
  "userName": "admin",
  "role": "Admin",
  "fullName": "John Administrator"
}
```

### 5. Create User

- **Endpoint**: `POST /api/User`
- **Description**: Create a new user
- **Request Body**: User object

**Example Request:**

```http
POST /api/User
Content-Type: application/json

{
  "userId": "U002",
  "userName": "waiter1",
  "password": "waiter123",
  "role": "Waiter",
  "right": "Limited",
  "fullName": "Jane Waiter",
  "phone": 9876543210,
  "email": "waiter@restaurant.com"
}
```

### 6. Update User

- **Endpoint**: `PUT /api/User/{id}`
- **Description**: Update an existing user
- **Parameters**:
  - `id` (string): User ID
- **Request Body**: User object

### 7. Delete User

- **Endpoint**: `DELETE /api/User/{id}`
- **Description**: Delete a user
- **Parameters**:
  - `id` (string): User ID

**Example Request:**

```http
DELETE /api/User/U002
```

---

## 🏪 **TABLE MANAGEMENT**

### 1. Get All Tables

- **Endpoint**: `GET /api/Table`
- **Description**: Retrieve all tables

**Example Request:**

```http
GET /api/Table
```

**Example Response:**

```json
[
  {
    "tableId": "T001",
    "tableName": "Table 1",
    "numOfSeats": 4,
    "status": "Available"
  },
  {
    "tableId": "T002",
    "tableName": "Table 2",
    "numOfSeats": 6,
    "status": "Occupied"
  }
]
```

### 2. Get Table by ID

- **Endpoint**: `GET /api/Table/{id}`
- **Description**: Retrieve a specific table

**Example Request:**

```http
GET /api/Table/T001
```

### 3. Get Available Tables

- **Endpoint**: `GET /api/Table/available`
- **Description**: Retrieve all available tables (not occupied)

**Example Request:**

```http
GET /api/Table/available
```

### 4. Create Table

- **Endpoint**: `POST /api/Table`
- **Description**: Create a new table

**Example Request:**

```http
POST /api/Table
Content-Type: application/json

{
  "tableId": "T003",
  "tableName": "Table 3",
  "numOfSeats": 8,
  "status": "Available"
}
```

### 5. Update Table

- **Endpoint**: `PUT /api/Table/{id}`
- **Description**: Update table information

### 6. Delete Table

- **Endpoint**: `DELETE /api/Table/{id}`
- **Description**: Delete a table

---

## 🍕 **FOOD & CATEGORY MANAGEMENT**

### Categories

#### 1. Get All Categories

- **Endpoint**: `GET /api/Category`
- **Description**: Retrieve all food categories

**Example Request:**

```http
GET /api/Category
```

**Example Response:**

```json
[
  {
    "cateId": "C001",
    "cateName": "Appetizers",
    "description": "Starter dishes"
  },
  {
    "cateId": "C002",
    "cateName": "Main Course",
    "description": "Main dishes"
  }
]
```

#### 2. Get Category by ID

- **Endpoint**: `GET /api/Category/{id}`

#### 3. Create Category

- **Endpoint**: `POST /api/Category`

**Example Request:**

```http
POST /api/Category
Content-Type: application/json

{
  "cateId": "C003",
  "cateName": "Desserts",
  "description": "Sweet dishes"
}
```

#### 4. Update Category

- **Endpoint**: `PUT /api/Category/{id}`

#### 5. Delete Category

- **Endpoint**: `DELETE /api/Category/{id}`

### Food Items

#### 1. Get All Food Items

- **Endpoint**: `GET /api/FoodInfo`
- **Description**: Retrieve all food items with category information
- **⚡ Updated**: Now returns clean data without circular references

**Example Request:**

```http
GET /api/FoodInfo
```

**Example Response (Updated Format):**

```json
[
  {
    "foodId": "F001",
    "foodName": "Caesar Salad",
    "foodImage": "caesar_salad.jpg",
    "unitPrice": 12.99,
    "description": "Fresh romaine lettuce with caesar dressing",
    "cateId": "C001",
    "categoryName": "Appetizers"
  },
  {
    "foodId": "1",
    "foodName": "Cơm gà xối mỡ",
    "unitPrice": 56000.0,
    "cateId": "1",
    "foodImage": "https://barona.vn/storage/meo-vat/83/com-ga-xoi-mo.jpg",
    "categoryName": "Cơm"
  }
]
```

**⚠️ Breaking Change**: Previously returned nested `cate` object with potential circular references. Now returns flat structure with `categoryName` field.

#### 2. Get Food Item by ID

- **Endpoint**: `GET /api/FoodInfo/{id}`

**Example Request:**

```http
GET /api/FoodInfo/F001
```

#### 3. Get Food Items by Category

- **Endpoint**: `GET /api/FoodInfo/category/{categoryId}`

**Example Request:**

```http
GET /api/FoodInfo/category/C001
```

#### 4. Create Food Item

- **Endpoint**: `POST /api/FoodInfo`

**Example Request:**

```http
POST /api/FoodInfo
Content-Type: application/json

{
  "foodId": "F002",
  "foodName": "Grilled Chicken",
  "foodImage": "grilled_chicken.jpg",
  "unitPrice": 18.99,
  "description": "Tender grilled chicken breast",
  "cateId": "C002"
}
```

#### 5. Update Food Item

- **Endpoint**: `PUT /api/FoodInfo/{id}`

#### 6. Delete Food Item

- **Endpoint**: `DELETE /api/FoodInfo/{id}`

---

## 📝 **ORDER MANAGEMENT**

### 1. Get All Orders

- **Endpoint**: `GET /api/Order`
- **Description**: Retrieve all orders with details
- **⚡ Updated**: Returns clean DTO format without circular references

**Example Request:**

```http
GET /api/Order
```

**Example Response (Updated DTO Format):**

```json
[
  {
    "orderId": "O001",
    "tableId": "T001",
    "userId": "U001",
    "userName": "John Doe",
    "tableName": "Table 1",
    "orderDate": "2025-09-12T14:30:00",
    "status": "Pending",
    "total": 45.97,
    "note": "Extra spicy",
    "discount": 5.0,
    "orderDetails": [
      {
        "foodId": "F001",
        "foodName": "Caesar Salad",
        "quantity": 2,
        "unitPrice": 12.99
      }
    ]
  }
]
```

**⚠️ Breaking Change**: No longer returns nested objects with potential circular references. User and table information is flattened.

### 2. Get Order by ID

- **Endpoint**: `GET /api/Order/{id}`
- **Description**: Retrieve specific order with full details
- **⚡ Updated**: Returns clean DTO format without circular references

**Example Request:**

```http
GET /api/Order/O001
```

**Example Response (Updated Clean Format):**

```json
{
  "orderId": "O001",
  "tableId": "T001",
  "userId": "U001",
  "userName": "John Doe",
  "tableName": "Table 1",
  "orderDate": "2025-09-12T14:30:00",
  "status": "Pending",
  "total": 45.97,
  "note": "Extra spicy",
  "discount": 5.0,
  "orderDetails": [
    {
      "foodId": "F001",
      "foodName": "Caesar Salad",
      "quantity": 2,
      "unitPrice": 12.99
    }
  ]
}
```

**⚠️ Breaking Change**: Previously included full nested objects. Now returns flattened structure with essential information only.

### 3. Get Orders by Table

- **Endpoint**: `GET /api/Order/table/{tableId}`

**Example Request:**

```http
GET /api/Order/table/T001
```

### 4. Get Orders by User

- **Endpoint**: `GET /api/Order/user/{userId}`

**Example Request:**

```http
GET /api/Order/user/U001
```

### 5. Get Orders by Status

- **Endpoint**: `GET /api/Order/status/{status}`

**Example Request:**

```http
GET /api/Order/status/Pending
```

### 6. Create Order

- **Endpoint**: `POST /api/Order`

**Example Request:**

```http
POST /api/Order
Content-Type: application/json

{
  "orderId": "O002",
  "status": "Pending",
  "total": 25.98,
  "note": "No onions",
  "discount": 0,
  "tableId": "T002",
  "userId": "U001"
}
```

### 7. Update Order

- **Endpoint**: `PUT /api/Order/{id}`

### 8. Delete Order

- **Endpoint**: `DELETE /api/Order/{id}`

---

## 🍽️ **ORDER DETAILS MANAGEMENT**

### 1. Get All Order Details

- **Endpoint**: `GET /api/OrderDetail`

### 2. Get Order Details by Order

- **Endpoint**: `GET /api/OrderDetail/order/{orderId}`
- **⚡ Updated**: Returns clean format without circular references

**Example Request:**

```http
GET /api/OrderDetail/order/O001
```

**Example Response (Updated Clean Format):**

```json
[
  {
    "foodId": "F001",
    "orderId": "O001",
    "quantity": 2,
    "foodName": "Caesar Salad",
    "unitPrice": 12.99
  }
]
```

**⚠️ Breaking Change**: No longer returns nested `food` object. Food information is flattened into the response.

### 3. Get Specific Order Detail

- **Endpoint**: `GET /api/OrderDetail/food/{foodId}/order/{orderId}`

### 4. Create Order Detail

- **Endpoint**: `POST /api/OrderDetail`

**Example Request:**

```http
POST /api/OrderDetail
Content-Type: application/json

{
  "foodId": "F001",
  "orderId": "O001",
  "quantity": 2
}
```

### 5. Update Order Detail

- **Endpoint**: `PUT /api/OrderDetail/food/{foodId}/order/{orderId}`

### 6. Delete Order Detail

- **Endpoint**: `DELETE /api/OrderDetail/food/{foodId}/order/{orderId}`

---

## 💰 **BILLING MANAGEMENT**

### 1. Get All Bills

- **Endpoint**: `GET /api/Bill`
- **Description**: Retrieve all bills with order and user information
- **⚡ Updated**: Returns clean format without circular references

**Example Request:**

```http
GET /api/Bill
```

**Example Response (Updated Clean Format):**

```json
[
  {
    "billId": "B001",
    "total": 45.97,
    "discount": 5.0,
    "totalFinal": 40.97,
    "payment": "Cash",
    "createdTime": "2025-09-12T15:30:00",
    "orderId": "O001",
    "userId": "U001",
    "userName": "John Doe",
    "orderDate": "2025-09-12T14:30:00"
  }
]
```

**⚠️ Breaking Change**: User and order information is now flattened instead of nested objects.

### 2. Get Bill by ID

- **Endpoint**: `GET /api/Bill/{id}`

**Example Request:**

```http
GET /api/Bill/B001
```

### 3. Get Bills by Order

- **Endpoint**: `GET /api/Bill/order/{orderId}`

**Example Request:**

```http
GET /api/Bill/order/O001
```

### 4. Get Bills by User

- **Endpoint**: `GET /api/Bill/user/{userId}`

### 5. Get Bills by Date

- **Endpoint**: `GET /api/Bill/date/{date}`

**Example Request:**

```http
GET /api/Bill/date/2025-09-12
```

### 6. Create Bill

- **Endpoint**: `POST /api/Bill`

**Example Request:**

```http
POST /api/Bill
Content-Type: application/json

{
  "billId": "B002",
  "total": 25.98,
  "discount": 2.00,
  "totalFinal": 23.98,
  "payment": "Credit Card",
  "orderId": "O002",
  "userId": "U001"
}
```

### 7. Update Bill

- **Endpoint**: `PUT /api/Bill/{id}`

### 8. Delete Bill

- **Endpoint**: `DELETE /api/Bill/{id}`

---

## 📄 **BILL DETAILS MANAGEMENT**

### 1. Get All Bill Details

- **Endpoint**: `GET /api/BillDetail`

### 2. Get Bill Details by Bill

- **Endpoint**: `GET /api/BillDetail/bill/{billId}`

**Example Request:**

```http
GET /api/BillDetail/bill/B001
```

### 3. Get Specific Bill Detail

- **Endpoint**: `GET /api/BillDetail/order/{orderId}/bill/{billId}`

### 4. Create Bill Detail

- **Endpoint**: `POST /api/BillDetail`

### 5. Update Bill Detail

- **Endpoint**: `PUT /api/BillDetail/order/{orderId}/bill/{billId}`

### 6. Delete Bill Detail

- **Endpoint**: `DELETE /api/BillDetail/order/{orderId}/bill/{billId}`

---

## 🥕 **INGREDIENT MANAGEMENT**

### 1. Get All Ingredients

- **Endpoint**: `GET /api/Ingredient`

**Example Request:**

```http
GET /api/Ingredient
```

**Example Response:**

```json
[
  {
    "ingreId": "I001",
    "ingreName": "Lettuce",
    "stock": 50,
    "unitMeasurement": "kg"
  },
  {
    "ingreId": "I002",
    "ingreName": "Chicken Breast",
    "stock": 25,
    "unitMeasurement": "kg"
  }
]
```

### 2. Get Ingredient by ID

- **Endpoint**: `GET /api/Ingredient/{id}`

### 3. Get Low Stock Ingredients

- **Endpoint**: `GET /api/Ingredient/lowstock/{threshold}`

**Example Request:**

```http
GET /api/Ingredient/lowstock/10
```

### 4. Update Ingredient Stock

- **Endpoint**: `PUT /api/Ingredient/{id}/stock/{quantity}`

**Example Request:**

```http
PUT /api/Ingredient/I001/stock/75
```

### 5. Create Ingredient

- **Endpoint**: `POST /api/Ingredient`

**Example Request:**

```http
POST /api/Ingredient
Content-Type: application/json

{
  "ingreId": "I003",
  "ingreName": "Tomatoes",
  "stock": 30,
  "unitMeasurement": "kg"
}
```

### 6. Update Ingredient

- **Endpoint**: `PUT /api/Ingredient/{id}`

### 7. Delete Ingredient

- **Endpoint**: `DELETE /api/Ingredient/{id}`

---

## 📋 **RECIPE MANAGEMENT**

### 1. Get All Recipes

- **Endpoint**: `GET /api/Recipe`
- **Description**: Retrieve all recipes with ingredients
- **⚡ Updated**: Returns clean format without circular references

**Example Request:**

```http
GET /api/Recipe
```

**Example Response (Updated Clean Format):**

```json
[
  {
    "recipeId": "R001",
    "foodId": "F001",
    "foodName": "Caesar Salad",
    "recipeDescription": "Mix lettuce with dressing",
    "recipeDetails": [
      {
        "recipeId": "R001",
        "ingredientId": "I001",
        "ingredientName": "Lettuce",
        "quantity": 0.2,
        "unitMeasurement": "kg"
      }
    ]
  }
]
```

**⚠️ Breaking Change**: Recipe details no longer contain nested `ingre` objects. Ingredient information is flattened.

### 2. Get Recipe by ID

- **Endpoint**: `GET /api/Recipe/{id}`

### 3. Get Recipes by Food

- **Endpoint**: `GET /api/Recipe/food/{foodId}`

**Example Request:**

```http
GET /api/Recipe/food/F001
```

### 4. Create Recipe

- **Endpoint**: `POST /api/Recipe`

### 5. Update Recipe

- **Endpoint**: `PUT /api/Recipe/{id}`

### 6. Delete Recipe

- **Endpoint**: `DELETE /api/Recipe/{id}`

---

## 🥗 **RECIPE DETAILS MANAGEMENT**

### 1. Get All Recipe Details

- **Endpoint**: `GET /api/RecipeDetail`
- **⚡ Updated**: Returns clean format without circular references

**Example Response (Updated Clean Format):**

```json
[
  {
    "recipeId": "R001",
    "ingredientId": "I001",
    "ingredientName": "Lettuce",
    "quantity": 0.2,
    "unitMeasurement": "kg"
  }
]
```

### 2. Get Recipe Details by Recipe

- **Endpoint**: `GET /api/RecipeDetail/recipe/{recipeId}`
- **⚡ Updated**: Returns clean format without circular references

**Example Request:**

```http
GET /api/RecipeDetail/recipe/R001
```

**Example Response (Updated Clean Format):**

```json
[
  {
    "recipeId": "R001",
    "ingredientId": "I001",
    "ingredientName": "Lettuce",
    "quantity": 0.2,
    "unitMeasurement": "kg"
  }
]
```

**⚠️ Breaking Change**: No longer returns nested recipe or ingredient objects. All information is flattened.

### 3. Get Specific Recipe Detail

- **Endpoint**: `GET /api/RecipeDetail/{recipeId}/{ingredientId}`
- **⚡ Updated**: Returns clean format without circular references

**Example Response (Updated Clean Format):**

```json
{
  "recipeId": "R001",
  "ingredientId": "I001",
  "ingredientName": "Lettuce",
  "quantity": 0.2,
  "unitMeasurement": "kg"
}
```

### 4. Create Recipe Detail

- **Endpoint**: `POST /api/RecipeDetail`

**Example Request:**

```http
POST /api/RecipeDetail
Content-Type: application/json

{
  "recipeId": "R001",
  "ingreId": "I001",
  "quantity": 0.2
}
```

### 5. Update Recipe Detail

- **Endpoint**: `PUT /api/RecipeDetail/recipe/{recipeId}/ingredient/{ingredientId}`

### 6. Delete Recipe Detail

- **Endpoint**: `DELETE /api/RecipeDetail/recipe/{recipeId}/ingredient/{ingredientId}`

---

## ⚠️ **ERROR RESPONSES**

### Common HTTP Status Codes:

- **200 OK**: Successful GET, PUT requests
- **201 Created**: Successful POST requests
- **204 No Content**: Successful DELETE requests
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Authentication failed
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource already exists

### Example Error Response:

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.4",
  "title": "Not Found",
  "status": 404,
  "detail": "User with ID 'U999' not found"
}
```

---

## 🔗 **API Testing Examples**

### Using cURL:

**Get all users:**

```bash
curl -X GET "http://localhost:8080/api/User" -H "accept: application/json"
```

**Login:**

```bash
curl -X POST "http://localhost:8080/api/User/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Create order:**

```bash
curl -X POST "http://localhost:8080/api/Order" \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "O003",
    "status": "Pending",
    "total": 35.50,
    "tableId": "T001",
    "userId": "U001"
  }'
```

### Using JavaScript (Fetch API):

```javascript
// Get all food items
fetch("http://localhost:8080/api/FoodInfo")
  .then((response) => response.json())
  .then((data) => console.log(data));

// Login
fetch("http://localhost:8080/api/User/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    username: "admin",
    password: "admin123",
  }),
})
  .then((response) => response.json())
  .then((data) => console.log(data));
```

---

## 📊 **Data Models Summary**

### User Model:

```json
{
  "userId": "string",
  "userName": "string",
  "password": "string",
  "role": "string",
  "right": "string",
  "fullName": "string",
  "phone": "integer",
  "email": "string"
}
```

### Order Model:

```json
{
  "orderId": "string",
  "createdTime": "datetime",
  "status": "string",
  "total": "decimal",
  "note": "string",
  "discount": "decimal",
  "tableId": "string",
  "userId": "string"
}
```

### FoodInfo Model:

```json
{
  "foodId": "string",
  "foodName": "string",
  "foodImage": "string",
  "unitPrice": "decimal",
  "description": "string",
  "cateId": "string"
}
```

---

## 🛠️ **Development Notes**

- All IDs are string-based
- Timestamps are automatically set for Bills and Orders on creation
- CORS is enabled for all origins
- Swagger UI available at `/swagger` endpoint
- Database uses Entity Framework Core with SQL Server
- All controllers support standard CRUD operations

### **📊 API Performance Improvements**

- **Eliminated $ref Objects**: No more circular reference handling needed in client apps
- **DTO Pattern**: Clean, predictable data structures across all endpoints
- **Reduced Payload Size**: Flattened responses mean smaller data transfers
- **Better Caching**: Consistent data format enables better client-side caching

### **🔄 Migration Guide for Existing Clients**

If you're updating from the previous API version:

1. **Remove $ref handling logic** from your client applications
2. **Update data extraction** to expect direct arrays instead of `$values` wrapped arrays
3. **Flatten nested object access** (e.g., `item.cate.cateName` → `item.categoryName`)
4. **Update error handling** for cleaner, more consistent error responses

### **🏗️ Architecture Changes**

- **Program.cs**: Removed `ReferenceHandler.Preserve` from JSON serialization
- **All Controllers**: Implemented DTO pattern for GET endpoints
- **Entity Framework**: Modified Include() queries to return clean data structures
- **JSON Responses**: Optimized for mobile app consumption

---

**Generated on:** September 20, 2025  
**API Version:** 2.0 (Breaking Changes)  
**Framework:** ASP.NET Core 8.0  
**Docker Hub:** `bao2211/rms-apiserver:latest`
