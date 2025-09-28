# Restaurant Management System – API Guide
_Last updated: September 28, 2025_

## Base URLs
- **Production**: `http://46.250.231.129:8080/api`
- **Local (HTTPS)**: `https://localhost:7127/api`
- **Local (HTTP)**: `http://localhost:8080/api`

All examples below assume the production base URL unless noted otherwise.

---

## Conventions
- Requests and responses use `application/json`.
- Identifier fields in the database are fixed-length strings (usually 10 characters). Trim IDs before sending them.
- Date/time values are returned in ISO-8601 format (UTC).
- Amount fields are decimals (VND) and may be returned as numbers or strings depending on the endpoint.

---

## Authentication
The current deployment does not require authentication tokens. User login is handled via `/api/User/login` and returns the hydrated user record that can be cached client-side.

---

## 1. User Management

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/User` | List all users |
| GET | `/User/{userId}` | Retrieve a single user by ID |
| GET | `/User/username/{username}` | Look up by username |
| POST | `/User/login` | Validate credentials |
| POST | `/User` | Create a new user |
| PUT | `/User/{userId}` | Update an existing user |
| DELETE | `/User/{userId}` | Soft-delete a user |

### Example – Login
```http
POST /api/User/login
Content-Type: application/json

{
  "userName": "admin",
  "password": "P@ssword123"
}
```
**Response**
```json
{
  "userId": "USER000001",
  "userName": "admin",
  "fullName": "Site Administrator",
  "email": "admin@restaurant.com",
  "role": "Admin",
  "status": "Active"
}
```

---

## 2. Food Information

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/FoodInfo` | List all dishes |
| GET | `/FoodInfo/{foodId}` | Retrieve a dish by ID |
| GET | `/FoodInfo/category/{categoryId}` | List dishes by category |
| POST | `/FoodInfo` | Create a dish |
| PUT | `/FoodInfo/{foodId}` | Update a dish |
| DELETE | `/FoodInfo/{foodId}` | Delete a dish (fails if in use) |

### Example – Retrieve Food Item
```http
GET /api/FoodInfo/10
```
**Response**
```json
{
  "foodId": "10",
  "foodName": "Cơm Gà Xối Mỡ",
  "description": "Fried chicken with rice",
  "unitPrice": 45000.0,
  "cateId": "CATE000003",
  "imgUrl": "https://cdn.example.com/foods/10.jpg"
}
```

---

## 3. Category Management

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/Category` | List all categories |
| GET | `/Category/{categoryId}` | Retrieve category detail |
| POST | `/Category` | Create a category |
| PUT | `/Category/{categoryId}` | Update a category |
| DELETE | `/Category/{categoryId}` | Delete a category (fails if dishes exist) |

### Example – Category List
```http
GET /api/Category
```
**Response**
```json
{
  "cateId": "CATE000001",
  "cateName": "Món Chính",
  "description": "Main courses"
}
```

---

## 4. Table Management

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/Table` | List all tables |
| GET | `/Table/{tableId}` | Retrieve table detail |
| GET | `/Table/available` | List currently available tables |
| POST | `/Table` | Create a table |
| PUT | `/Table/{tableId}` | Update status or metadata |
| DELETE | `/Table/{tableId}` | Remove a table |

### Example – Update Table Status
```http
PUT /api/Table/TBL0000003
Content-Type: application/json

{
  "tableId": "TBL0000003",
  "tableName": "Bàn 3",
  "capacity": 4,
  "status": "Occupied"
}
```
**Response**
```json
{
  "message": "Table updated successfully"
}
```

---

## 5. Order Management

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/Order` | List all orders |
| GET | `/Order/{orderId}` | Retrieve order detail |
| GET | `/Order/table/{tableId}` | Orders for a specific table |
| GET | `/Order/user/{userId}` | Orders created by a user |
| GET | `/Order/status/{status}` | Filter orders by status |
| POST | `/Order` | Create an order |
| PUT | `/Order/{orderId}` | Update an order |
| DELETE | `/Order/{orderId}` | Delete an order |

**Order status values**: `Pending`, `InProgress`, `Completed`, `Cancelled` (Vietnamese aliases such as `Đang xử lý` may also appear depending on data).

### Example – Create Order
```http
POST /api/Order
Content-Type: application/json

{
  "orderId": "HD390A7803",
  "tableId": "TBL0000003",
  "userId": "USER000014",
  "status": "Pending",
  "note": "VIP guest",
  "discount": 10000,
  "total": 235000
}
```
**Response**
```json
{
  "orderId": "HD390A7803",
  "createdTime": "2025-09-28T09:15:42Z",
  "status": "Pending",
  "tableId": "TBL0000003",
  "userId": "USER000014",
  "total": 235000,
  "discount": 10000,
  "note": "VIP guest"
}
```

---

## 6. Order Detail Management

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/OrderDetail` | List all order line items |
| GET | `/OrderDetail/order/{orderId}` | Order lines for a specific order |
| GET | `/OrderDetail/food/{foodId}/order/{orderId}` | Retrieve a single line item |
| POST | `/OrderDetail` | Create an order line |
| PUT | `/OrderDetail/food/{foodId}/order/{orderId}` | Update an order line |
| DELETE | `/OrderDetail/food/{foodId}/order/{orderId}` | Delete an order line |

**Order detail status values**: `Chưa làm` (Not started) and `Hoàn tất` (Completed). Older records may still hold `Pending` or `Đang chuẩn bị`; normalize these to the supported set when consuming the API.

### Example – Order Detail List (excerpt)
```http
GET /api/OrderDetail/order/HD390A7803
```
**Response**
```json
{
  "foodId": "10",
  "orderId": "HD390A7803",
  "quantity": 2,
  "unitPrice": 45000,
  "status": "Hoàn tất"
}
```

### Example – Update Order Detail Status
```http
PUT /api/OrderDetail/food/11/order/HD390A7803
Content-Type: application/json

{
  "foodId": "11",
  "orderId": "HD390A7803",
  "quantity": 1,
  "unitPrice": 30000,
  "status": "Hoàn tất"
}
```
**Response**
```json
{
  "message": "Order detail updated successfully",
  "orderDetail": {
    "foodId": "11",
    "orderId": "HD390A7803",
    "quantity": 1,
    "unitPrice": 30000,
    "status": "Hoàn tất"
  }
}
```

---

## 7. Bill Management

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/Bill` | List all bills |
| GET | `/Bill/{billId}` | Retrieve bill detail |
| GET | `/Bill/order/{orderId}` | Bills generated for an order |
| GET | `/Bill/user/{userId}` | Bills associated with a user |
| GET | `/Bill/date/{yyyy-MM-dd}` | Bills on a specific date |
| POST | `/Bill` | Create a bill |
| PUT | `/Bill/{billId}` | Update a bill |
| DELETE | `/Bill/{billId}` | Delete a bill |

### Example – Create Bill
```http
POST /api/Bill
Content-Type: application/json

{
  "billId": "BL25092801",
  "orderId": "HD390A7803",
  "userId": "USER000014",
  "total": 235000,
  "status": "Open"
}
```
**Response**
```json
{
  "billId": "BL25092801",
  "orderId": "HD390A7803",
  "userId": "USER000014",
  "total": 235000,
  "status": "Open",
  "createdTime": "2025-09-28T09:20:32Z"
}
```

---

## 8. Bill Detail Management

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/BillDetail` | List all bill line items |
| GET | `/BillDetail/bill/{billId}` | Lines associated with a bill |
| GET | `/BillDetail/order/{orderId}/bill/{billId}` | Retrieve a single bill line |
| POST | `/BillDetail` | Create a bill line |
| PUT | `/BillDetail/order/{orderId}/bill/{billId}` | Update a bill line |
| DELETE | `/BillDetail/order/{orderId}/bill/{billId}` | Delete a bill line |

### Example – Bill Detail Response
```http
GET /api/BillDetail/bill/BL25092801
```
**Response**
```json
{
  "billId": "BL25092801",
  "orderId": "HD390A7803",
  "foodId": "10",
  "quantity": 2,
  "unitPrice": 45000,
  "lineTotal": 90000
}
```

---

## 9. Recipe & Ingredient Management (optional modules)

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/Recipe` | List all recipes |
| GET | `/Recipe/{recipeId}` | Retrieve recipe detail |
| GET | `/Recipe/food/{foodId}` | Recipes for a dish |
| POST | `/Recipe` | Create a recipe |
| PUT | `/Recipe/{recipeId}` | Update a recipe |
| DELETE | `/Recipe/{recipeId}` | Delete a recipe |
| GET | `/RecipeDetail` | List recipe line items |
| GET | `/RecipeDetail/recipe/{recipeId}` | Details for a recipe |
| GET | `/Ingredient` | List ingredients |

Example payloads mirror the bill detail shape, with `ingredientId`, `quantity`, and `unit` fields.

---

## Error Handling
- Validation failures return **400 Bad Request** with `message` and `errors` collections.
- Duplicate keys (e.g., inserting another order detail with the same `foodId` + `orderId`) return **409 Conflict**.
- Missing resources return **404 Not Found**.
- Unexpected issues return **500 Internal Server Error**.

Example error body:
```json
{
  "message": "Cannot delete food item. It is being used by existing orders or recipes.",
  "relatedOrders": ["HD390A7803"],
  "relatedRecipes": []
}
```

---

## Status Reference

| Entity | Field | Allowed Values |
| ------ | ----- | -------------- |
| Order | `status` | `Pending`, `InProgress`, `Completed`, `Cancelled` (may appear in Vietnamese) |
| Order Detail | `status` | `Chưa làm`, `Hoàn tất` |
| Bill | `status` | `Open`, `Paid`, `Cancelled` |

Normalize and localize these values on the client as needed.

---

## Useful Tips
- Use the `/api/OrderDetail/order/{orderId}` endpoint for reliable detail lists. It returns completed items even when the bulk `/api/OrderDetail` endpoint omits them because of historic status values.
- When connecting from mobile, ensure your device can reach `46.250.231.129` on port `8080`.
- For local testing with self-signed certificates, enable `TrustServerCertificate=True` in the connection string and set `NODE_TLS_REJECT_UNAUTHORIZED=0` (development only).

Happy coding! 🎉
