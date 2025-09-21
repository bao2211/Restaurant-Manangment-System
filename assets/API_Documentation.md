# Restaurant Management System - API Documentation

## Base URL

```
http://localhost:8080/api
```

## Table of Contents

1. [User Management](#user-management)
2. [Food Information Management](#food-information-management)
3. [Category Management](#category-management)
4. [Table Management](#table-management)
5. [Order Management](#order-management)
6. [Order Detail Management](#order-detail-management)
7. [Bill Management](#bill-management)
8. [Bill Detail Management](#bill-detail-management)
9. [Recipe Management](#recipe-management)
10. [Recipe Detail Management](#recipe-detail-management)
11. [Ingredient Management](#ingredient-management)

---

## User Management

### Get All Users

**GET** `/api/User`

**Response:**

```json
[
  {
    "userId": "1",
    "userName": "admin",
    "role": "Admin",
    "fullName": "Administrator",
    "email": "admin@restaurant.com"
  }
]
```

### Get User by ID

**GET** `/api/User/{id}`

**Parameters:**

- `id` (string): User ID

**Response:**

```json
{
  "userId": "1",
  "userName": "admin",
  "role": "Admin",
  "fullName": "Administrator",
  "email": "admin@restaurant.com"
}
```

### Get User by Username

**GET** `/api/User/username/{username}`

**Parameters:**

- `username` (string): Username

**Response:**

```json
{
  "userId": "1",
  "userName": "admin",
  "role": "Admin",
  "fullName": "Administrator",
  "email": "admin@restaurant.com"
}
```

### User Login

**POST** `/api/User/login`

**Request Body:**

```json
{
  "userName": "admin",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "userId": "1",
    "userName": "admin",
    "role": "Admin",
    "fullName": "Administrator"
  }
}
```

### Update User

**PUT** `/api/User/{id}`

**Parameters:**

- `id` (string): User ID

**Request Body:**

```json
{
  "userId": "1",
  "userName": "admin",
  "password": "newpassword123",
  "role": "Admin",
  "fullName": "Administrator",
  "email": "admin@restaurant.com"
}
```

**Response:**

```json
{
  "message": "User updated successfully"
}
```

### Create User

**POST** `/api/User`

**Request Body:**

```json
{
  "userId": "2",
  "userName": "staff01",
  "password": "password123",
  "role": "Staff",
  "fullName": "John Doe",
  "email": "john@restaurant.com"
}
```

**Response:**

```json
{
  "userId": "2",
  "userName": "staff01",
  "role": "Staff",
  "fullName": "John Doe",
  "email": "john@restaurant.com"
}
```

### Delete User

**DELETE** `/api/User/{id}`

**Parameters:**

- `id` (string): User ID

**Response:**

```json
{
  "message": "User deleted successfully.",
  "deletedUser": {
    "userId": "2",
    "userName": "staff01",
    "role": "Staff",
    "fullName": "John Doe",
    "email": "john@restaurant.com"
  },
  "deletedAt": "2025-09-21 10:30:45 UTC"
}
```

---

## Food Information Management

### Get All Food Items

**GET** `/api/FoodInfo`

**Response:**

```json
[
  {
    "foodId": "1",
    "foodName": "Chicken Curry",
    "price": 15.99,
    "description": "Spicy chicken curry",
    "cateId": "1",
    "status": "Available",
    "imgUrl": "https://example.com/chicken-curry.jpg"
  }
]
```

### Get Food Item by ID

**GET** `/api/FoodInfo/{id}`

**Parameters:**

- `id` (string): Food ID

**Response:**

```json
{
  "foodId": "1",
  "foodName": "Chicken Curry",
  "price": 15.99,
  "description": "Spicy chicken curry",
  "cateId": "1",
  "status": "Available",
  "imgUrl": "https://example.com/chicken-curry.jpg"
}
```

### Get Food Items by Category

**GET** `/api/FoodInfo/category/{categoryId}`

**Parameters:**

- `categoryId` (string): Category ID

**Response:**

```json
[
  {
    "foodId": "1",
    "foodName": "Chicken Curry",
    "price": 15.99,
    "description": "Spicy chicken curry",
    "cateId": "1",
    "status": "Available",
    "imgUrl": "https://example.com/chicken-curry.jpg"
  }
]
```

### Update Food Item

**PUT** `/api/FoodInfo/{id}`

**Parameters:**

- `id` (string): Food ID

**Request Body:**

```json
{
  "foodId": "1",
  "foodName": "Chicken Curry",
  "price": 16.99,
  "description": "Spicy chicken curry with vegetables",
  "cateId": "1",
  "status": "Available",
  "imgUrl": "https://example.com/chicken-curry.jpg"
}
```

**Response:**

```json
{
  "message": "Food item updated successfully"
}
```

### Create Food Item

**POST** `/api/FoodInfo`

**Request Body:**

```json
{
  "foodId": "2",
  "foodName": "Beef Steak",
  "price": 25.99,
  "description": "Grilled beef steak",
  "cateId": "1",
  "status": "Available",
  "imgUrl": "https://example.com/beef-steak.jpg"
}
```

**Response:**

```json
{
  "foodId": "2",
  "foodName": "Beef Steak",
  "price": 25.99,
  "description": "Grilled beef steak",
  "cateId": "1",
  "status": "Available",
  "imgUrl": "https://example.com/beef-steak.jpg"
}
```

### Delete Food Item

**DELETE** `/api/FoodInfo/{id}`

**Parameters:**

- `id` (string): Food ID

**Response:**

```json
{
  "message": "Food item deleted successfully.",
  "deletedFood": {
    "foodId": "2",
    "foodName": "Beef Steak"
  },
  "deletedAt": "2025-09-21 10:30:45 UTC"
}
```

**Error Response (Constraint Violation):**

```json
{
  "message": "Cannot delete food item. It is being used by existing orders or recipes.",
  "details": "Food item is used by 3 order(s) and 1 recipe(s). Please remove these dependencies first.",
  "relatedOrders": ["Order123", "Order124"],
  "relatedRecipes": ["Recipe001"]
}
```

---

## Category Management

### Get All Categories

**GET** `/api/Category`

**Response:**

```json
[
  {
    "cateId": "1",
    "cateName": "Main Dishes",
    "description": "Primary dishes"
  }
]
```

### Get Category by ID

**GET** `/api/Category/{id}`

**Parameters:**

- `id` (string): Category ID

**Response:**

```json
{
  "cateId": "1",
  "cateName": "Main Dishes",
  "description": "Primary dishes"
}
```

### Update Category

**PUT** `/api/Category/{id}`

**Parameters:**

- `id` (string): Category ID

**Request Body:**

```json
{
  "cateId": "1",
  "cateName": "Main Courses",
  "description": "Primary dishes and entrees"
}
```

**Response:**

```json
{
  "message": "Category updated successfully"
}
```

### Create Category

**POST** `/api/Category`

**Request Body:**

```json
{
  "cateId": "2",
  "cateName": "Desserts",
  "description": "Sweet dishes and desserts"
}
```

**Response:**

```json
{
  "cateId": "2",
  "cateName": "Desserts",
  "description": "Sweet dishes and desserts"
}
```

### Delete Category

**DELETE** `/api/Category/{id}`

**Parameters:**

- `id` (string): Category ID

**Response:**

```json
{
  "message": "Category deleted successfully.",
  "deletedCategory": {
    "cateId": "2",
    "cateName": "Desserts"
  },
  "deletedAt": "2025-09-21 10:30:45 UTC"
}
```

**Error Response (Constraint Violation):**

```json
{
  "message": "Cannot delete category. It is being used by existing food items.",
  "details": "Category is used by 5 food item(s). Please move or delete these food items first.",
  "foodItems": [
    { "foodId": "1", "foodName": "Chicken Curry" },
    { "foodId": "2", "foodName": "Beef Steak" }
  ]
}
```

---

## Table Management

### Get All Tables

**GET** `/api/Table`

**Response:**

```json
[
  {
    "tableId": "1",
    "tableName": "Table 1",
    "numOfSeats": 4,
    "status": "Available"
  }
]
```

### Get Table by ID

**GET** `/api/Table/{id}`

**Parameters:**

- `id` (string): Table ID

**Response:**

```json
{
  "tableId": "1",
  "tableName": "Table 1",
  "numOfSeats": 4,
  "status": "Available"
}
```

### Get Available Tables

**GET** `/api/Table/available`

**Response:**

```json
[
  {
    "tableId": "1",
    "tableName": "Table 1",
    "numOfSeats": 4,
    "status": "Available"
  }
]
```

### Update Table

**PUT** `/api/Table/{id}`

**Parameters:**

- `id` (string): Table ID

**Request Body:**

```json
{
  "tableId": "1",
  "tableName": "Table 1",
  "numOfSeats": 6,
  "status": "Occupied"
}
```

**Response:**

```json
{
  "message": "Table updated successfully"
}
```

### Create Table

**POST** `/api/Table`

**Request Body:**

```json
{
  "tableId": "2",
  "tableName": "Table 2",
  "numOfSeats": 2,
  "status": "Available"
}
```

**Response:**

```json
{
  "tableId": "2",
  "tableName": "Table 2",
  "numOfSeats": 2,
  "status": "Available"
}
```

### Delete Table

**DELETE** `/api/Table/{id}`

**Parameters:**

- `id` (string): Table ID

**Response:**

```json
{
  "message": "Table deleted successfully.",
  "deletedTable": {
    "tableId": "2",
    "tableName": "Table 2",
    "numOfSeats": 2,
    "status": "Available"
  },
  "deletedAt": "2025-09-21 10:30:45 UTC"
}
```

---

## Order Management

### Get All Orders

**GET** `/api/Order`

**Response:**

```json
[
  {
    "orderId": "1",
    "createdTime": "2025-09-21T10:00:00Z",
    "status": "Pending",
    "total": 31.98,
    "note": "Extra spicy",
    "discount": 0.0,
    "tableId": "1",
    "userId": "1"
  }
]
```

### Get Order by ID

**GET** `/api/Order/{id}`

**Parameters:**

- `id` (string): Order ID

**Response:**

```json
{
  "orderId": "1",
  "createdTime": "2025-09-21T10:00:00Z",
  "status": "Pending",
  "total": 31.98,
  "note": "Extra spicy",
  "discount": 0.0,
  "tableId": "1",
  "userId": "1"
}
```

### Get Orders by Table

**GET** `/api/Order/table/{tableId}`

**Parameters:**

- `tableId` (string): Table ID

**Response:**

```json
[
  {
    "orderId": "1",
    "createdTime": "2025-09-21T10:00:00Z",
    "status": "Pending",
    "total": 31.98,
    "tableId": "1"
  }
]
```

### Get Orders by User

**GET** `/api/Order/user/{userId}`

**Parameters:**

- `userId` (string): User ID

**Response:**

```json
[
  {
    "orderId": "1",
    "createdTime": "2025-09-21T10:00:00Z",
    "status": "Pending",
    "total": 31.98,
    "userId": "1"
  }
]
```

### Get Orders by Status

**GET** `/api/Order/status/{status}`

**Parameters:**

- `status` (string): Order status (e.g., "Pending", "Completed", "Cancelled")

**Response:**

```json
[
  {
    "orderId": "1",
    "status": "Pending",
    "total": 31.98,
    "tableId": "1"
  }
]
```

### Update Order

**PUT** `/api/Order/{id}`

**Parameters:**

- `id` (string): Order ID

**Request Body:**

```json
{
  "orderId": "1",
  "status": "Completed",
  "total": 31.98,
  "note": "Extra spicy - completed",
  "discount": 2.0,
  "tableId": "1",
  "userId": "1"
}
```

**Response:**

```json
{
  "message": "Order updated successfully"
}
```

### Create Order

**POST** `/api/Order`

**Request Body:**

```json
{
  "orderId": "2",
  "status": "Pending",
  "total": 45.5,
  "note": "No onions",
  "discount": 0.0,
  "tableId": "2",
  "userId": "1"
}
```

**Response:**

```json
{
  "orderId": "2",
  "createdTime": "2025-09-21T10:15:00Z",
  "status": "Pending",
  "total": 45.5,
  "note": "No onions",
  "discount": 0.0,
  "tableId": "2",
  "userId": "1"
}
```

### Delete Order

**DELETE** `/api/Order/{id}`

**Parameters:**

- `id` (string): Order ID

**Response:**

```json
{
  "message": "Order deleted successfully.",
  "deletedOrder": {
    "orderId": "2",
    "createdTime": "2025-09-21T10:15:00Z",
    "status": "Pending",
    "total": 45.5,
    "tableId": "2"
  },
  "deletedAt": "2025-09-21 10:30:45 UTC"
}
```

---

## Order Detail Management

### Get All Order Details

**GET** `/api/OrderDetail`

**Response:**

```json
[
  {
    "foodId": "1",
    "orderId": "1",
    "unitPrice": 15.99,
    "status": "Pending",
    "quantity": 2
  }
]
```

### Get Order Details by Order

**GET** `/api/OrderDetail/order/{orderId}`

**Parameters:**

- `orderId` (string): Order ID

**Response:**

```json
[
  {
    "foodId": "1",
    "orderId": "1",
    "unitPrice": 15.99,
    "status": "Pending",
    "quantity": 2
  }
]
```

### Get Order Detail by Food and Order

**GET** `/api/OrderDetail/food/{foodId}/order/{orderId}`

**Parameters:**

- `foodId` (string): Food ID
- `orderId` (string): Order ID

**Response:**

```json
{
  "foodId": "1",
  "orderId": "1",
  "unitPrice": 15.99,
  "status": "Pending",
  "quantity": 2
}
```

### Update Order Detail

**PUT** `/api/OrderDetail/food/{foodId}/order/{orderId}`

**Parameters:**

- `foodId` (string): Food ID
- `orderId` (string): Order ID

**Request Body:**

```json
{
  "foodId": "1",
  "orderId": "1",
  "unitPrice": 15.99,
  "status": "Completed",
  "quantity": 3
}
```

**Response:**

```json
{
  "message": "Order detail updated successfully"
}
```

### Create Order Detail

**POST** `/api/OrderDetail`

**Request Body:**

```json
{
  "foodId": "2",
  "orderId": "1",
  "unitPrice": 25.99,
  "status": "Pending",
  "quantity": 1
}
```

**Response:**

```json
{
  "foodId": "2",
  "orderId": "1",
  "unitPrice": 25.99,
  "status": "Pending",
  "quantity": 1
}
```

### Delete Order Detail

**DELETE** `/api/OrderDetail/food/{foodId}/order/{orderId}`

**Parameters:**

- `foodId` (string): Food ID
- `orderId` (string): Order ID

**Response:**

```json
{
  "message": "Order detail deleted successfully.",
  "deletedOrderDetail": {
    "foodId": "2",
    "orderId": "1",
    "unitPrice": 25.99,
    "status": "Pending",
    "quantity": 1
  },
  "deletedAt": "2025-09-21 10:30:45 UTC"
}
```

---

## Bill Management

### Get All Bills

**GET** `/api/Bill`

**Response:**

```json
[
  {
    "billId": "1",
    "total": 31.98,
    "discount": 2.0,
    "totalFinal": 29.98,
    "payment": "Credit Card",
    "createdTime": "2025-09-21T11:00:00Z",
    "orderId": "1",
    "userId": "1"
  }
]
```

### Get Bill by ID

**GET** `/api/Bill/{id}`

**Parameters:**

- `id` (string): Bill ID

**Response:**

```json
{
  "billId": "1",
  "total": 31.98,
  "discount": 2.0,
  "totalFinal": 29.98,
  "payment": "Credit Card",
  "createdTime": "2025-09-21T11:00:00Z",
  "orderId": "1",
  "userId": "1"
}
```

### Get Bills by Order

**GET** `/api/Bill/order/{orderId}`

**Parameters:**

- `orderId` (string): Order ID

**Response:**

```json
[
  {
    "billId": "1",
    "total": 31.98,
    "discount": 2.0,
    "totalFinal": 29.98,
    "orderId": "1"
  }
]
```

### Get Bills by User

**GET** `/api/Bill/user/{userId}`

**Parameters:**

- `userId` (string): User ID

**Response:**

```json
[
  {
    "billId": "1",
    "total": 31.98,
    "discount": 2.0,
    "totalFinal": 29.98,
    "userId": "1"
  }
]
```

### Get Bills by Date

**GET** `/api/Bill/date/{date}`

**Parameters:**

- `date` (string): Date in YYYY-MM-DD format

**Response:**

```json
[
  {
    "billId": "1",
    "total": 31.98,
    "discount": 2.0,
    "totalFinal": 29.98,
    "createdTime": "2025-09-21T11:00:00Z"
  }
]
```

### Update Bill

**PUT** `/api/Bill/{id}`

**Parameters:**

- `id` (string): Bill ID

**Request Body:**

```json
{
  "billId": "1",
  "total": 31.98,
  "discount": 3.0,
  "totalFinal": 28.98,
  "payment": "Cash",
  "orderId": "1",
  "userId": "1"
}
```

**Response:**

```json
{
  "message": "Bill updated successfully"
}
```

### Create Bill

**POST** `/api/Bill`

**Request Body:**

```json
{
  "billId": "2",
  "total": 45.5,
  "discount": 0.0,
  "totalFinal": 45.5,
  "payment": "Credit Card",
  "orderId": "2",
  "userId": "1"
}
```

**Response:**

```json
{
  "billId": "2",
  "total": 45.5,
  "discount": 0.0,
  "totalFinal": 45.5,
  "payment": "Credit Card",
  "createdTime": "2025-09-21T11:15:00Z",
  "orderId": "2",
  "userId": "1"
}
```

### Delete Bill

**DELETE** `/api/Bill/{id}`

**Parameters:**

- `id` (string): Bill ID

**Response:**

```json
{
  "message": "Bill deleted successfully.",
  "deletedBill": {
    "billId": "2",
    "orderId": "2",
    "total": 45.5,
    "totalFinal": 45.5,
    "createdTime": "2025-09-21T11:15:00Z"
  },
  "deletedAt": "2025-09-21 10:30:45 UTC"
}
```

---

## Bill Detail Management

### Get All Bill Details

**GET** `/api/BillDetail`

**Response:**

```json
[
  {
    "billId": "1",
    "orderId": "1",
    "quantity": 2,
    "unitPrice": 15.99
  }
]
```

### Get Bill Details by Bill

**GET** `/api/BillDetail/bill/{billId}`

**Parameters:**

- `billId` (string): Bill ID

**Response:**

```json
[
  {
    "billId": "1",
    "orderId": "1",
    "quantity": 2,
    "unitPrice": 15.99
  }
]
```

### Get Bill Detail by Order and Bill

**GET** `/api/BillDetail/order/{orderId}/bill/{billId}`

**Parameters:**

- `orderId` (string): Order ID
- `billId` (string): Bill ID

**Response:**

```json
{
  "billId": "1",
  "orderId": "1",
  "quantity": 2,
  "unitPrice": 15.99
}
```

### Update Bill Detail

**PUT** `/api/BillDetail/order/{orderId}/bill/{billId}`

**Parameters:**

- `orderId` (string): Order ID
- `billId` (string): Bill ID

**Request Body:**

```json
{
  "billId": "1",
  "orderId": "1",
  "quantity": 3,
  "unitPrice": 15.99
}
```

**Response:**

```json
{
  "message": "Bill detail updated successfully"
}
```

### Create Bill Detail

**POST** `/api/BillDetail`

**Request Body:**

```json
{
  "billId": "1",
  "orderId": "1",
  "quantity": 2,
  "unitPrice": 15.99
}
```

**Response:**

```json
{
  "billId": "1",
  "orderId": "1",
  "quantity": 2,
  "unitPrice": 15.99
}
```

### Delete Bill Detail

**DELETE** `/api/BillDetail/order/{orderId}/bill/{billId}`

**Parameters:**

- `orderId` (string): Order ID
- `billId` (string): Bill ID

**Response:**

```json
{
  "message": "Bill detail deleted successfully.",
  "deletedBillDetail": {
    "orderId": "1",
    "billId": "1",
    "quantity": 2,
    "unitPrice": 15.99
  },
  "deletedAt": "2025-09-21 10:30:45 UTC"
}
```

---

## Recipe Management

### Get All Recipes

**GET** `/api/Recipe`

**Response:**

```json
[
  {
    "recipeId": "1",
    "recipeDescription": "Traditional chicken curry recipe",
    "foodId": "1"
  }
]
```

### Get Recipe by ID

**GET** `/api/Recipe/{id}`

**Parameters:**

- `id` (string): Recipe ID

**Response:**

```json
{
  "recipeId": "1",
  "recipeDescription": "Traditional chicken curry recipe",
  "foodId": "1"
}
```

### Get Recipes by Food

**GET** `/api/Recipe/food/{foodId}`

**Parameters:**

- `foodId` (string): Food ID

**Response:**

```json
[
  {
    "recipeId": "1",
    "recipeDescription": "Traditional chicken curry recipe",
    "foodId": "1"
  }
]
```

### Update Recipe

**PUT** `/api/Recipe/{id}`

**Parameters:**

- `id` (string): Recipe ID

**Request Body:**

```json
{
  "recipeId": "1",
  "recipeDescription": "Updated chicken curry recipe with coconut milk",
  "foodId": "1"
}
```

**Response:**

```json
{
  "message": "Recipe updated successfully"
}
```

### Create Recipe

**POST** `/api/Recipe`

**Request Body:**

```json
{
  "recipeId": "2",
  "recipeDescription": "Grilled beef steak with herbs",
  "foodId": "2"
}
```

**Response:**

```json
{
  "recipeId": "2",
  "recipeDescription": "Grilled beef steak with herbs",
  "foodId": "2"
}
```

### Delete Recipe

**DELETE** `/api/Recipe/{id}`

**Parameters:**

- `id` (string): Recipe ID

**Response:**

```json
{
  "message": "Recipe deleted successfully.",
  "deletedRecipe": {
    "recipeId": "2",
    "recipeDescription": "Grilled beef steak with herbs",
    "foodId": "2"
  },
  "deletedAt": "2025-09-21 10:30:45 UTC"
}
```

---

## Recipe Detail Management

### Get All Recipe Details

**GET** `/api/RecipeDetail`

**Response:**

```json
[
  {
    "recipeId": "1",
    "ingreId": "1",
    "unitMeasurement": "grams",
    "quantity": 500
  }
]
```

### Get Recipe Details by Recipe

**GET** `/api/RecipeDetail/recipe/{recipeId}`

**Parameters:**

- `recipeId` (string): Recipe ID

**Response:**

```json
[
  {
    "recipeId": "1",
    "ingreId": "1",
    "unitMeasurement": "grams",
    "quantity": 500
  }
]
```

### Get Recipe Detail by Recipe and Ingredient

**GET** `/api/RecipeDetail/{recipeId}/{ingredientId}`

**Parameters:**

- `recipeId` (string): Recipe ID
- `ingredientId` (string): Ingredient ID

**Response:**

```json
{
  "recipeId": "1",
  "ingreId": "1",
  "unitMeasurement": "grams",
  "quantity": 500
}
```

### Update Recipe Detail

**PUT** `/api/RecipeDetail/{recipeId}/{ingredientId}`

**Parameters:**

- `recipeId` (string): Recipe ID
- `ingredientId` (string): Ingredient ID

**Request Body:**

```json
{
  "recipeId": "1",
  "ingreId": "1",
  "unitMeasurement": "grams",
  "quantity": 600
}
```

**Response:**

```json
{
  "message": "Recipe detail updated successfully"
}
```

### Create Recipe Detail

**POST** `/api/RecipeDetail`

**Request Body:**

```json
{
  "recipeId": "1",
  "ingreId": "2",
  "unitMeasurement": "ml",
  "quantity": 200
}
```

**Response:**

```json
{
  "recipeId": "1",
  "ingreId": "2",
  "unitMeasurement": "ml",
  "quantity": 200
}
```

### Delete Recipe Detail

**DELETE** `/api/RecipeDetail/{recipeId}/{ingredientId}`

**Parameters:**

- `recipeId` (string): Recipe ID
- `ingredientId` (string): Ingredient ID

**Response:**

```json
{
  "message": "Recipe detail deleted successfully.",
  "deletedRecipeDetail": {
    "recipeId": "1",
    "ingredientId": "2",
    "unitMeasurement": "ml",
    "quantity": 200
  },
  "deletedAt": "2025-09-21 10:30:45 UTC"
}
```

---

## Ingredient Management

### Get All Ingredients

**GET** `/api/Ingredient`

**Response:**

```json
[
  {
    "ingreId": "1",
    "ingreName": "Chicken Breast",
    "stock": 1000,
    "unitMeasurement": "grams"
  }
]
```

### Get Ingredient by ID

**GET** `/api/Ingredient/{id}`

**Parameters:**

- `id` (string): Ingredient ID

**Response:**

```json
{
  "ingreId": "1",
  "ingreName": "Chicken Breast",
  "stock": 1000,
  "unitMeasurement": "grams"
}
```

### Get Low Stock Ingredients

**GET** `/api/Ingredient/lowstock/{threshold}`

**Parameters:**

- `threshold` (number): Stock threshold level

**Response:**

```json
[
  {
    "ingreId": "2",
    "ingreName": "Coconut Milk",
    "stock": 50,
    "unitMeasurement": "ml"
  }
]
```

### Update Ingredient

**PUT** `/api/Ingredient/{id}`

**Parameters:**

- `id` (string): Ingredient ID

**Request Body:**

```json
{
  "ingreId": "1",
  "ingreName": "Chicken Breast (Premium)",
  "stock": 1200,
  "unitMeasurement": "grams"
}
```

**Response:**

```json
{
  "message": "Ingredient updated successfully"
}
```

### Update Ingredient Stock

**PUT** `/api/Ingredient/{id}/stock/{quantity}`

**Parameters:**

- `id` (string): Ingredient ID
- `quantity` (number): New stock quantity

**Response:**

```json
{
  "message": "Ingredient stock updated successfully"
}
```

### Create Ingredient

**POST** `/api/Ingredient`

**Request Body:**

```json
{
  "ingreId": "3",
  "ingreName": "Fresh Herbs",
  "stock": 200,
  "unitMeasurement": "grams"
}
```

**Response:**

```json
{
  "ingreId": "3",
  "ingreName": "Fresh Herbs",
  "stock": 200,
  "unitMeasurement": "grams"
}
```

### Delete Ingredient

**DELETE** `/api/Ingredient/{id}`

**Parameters:**

- `id` (string): Ingredient ID

**Response:**

```json
{
  "message": "Ingredient deleted successfully.",
  "deletedIngredient": {
    "ingreId": "3",
    "ingreName": "Fresh Herbs",
    "stock": 200,
    "unitMeasurement": "grams"
  },
  "deletedAt": "2025-09-21 10:30:45 UTC"
}
```

---

## Common HTTP Status Codes

### Success Responses

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **204 No Content**: Request successful, no content to return

### Error Responses

- **400 Bad Request**: Invalid request data
- **404 Not Found**: Resource not found
- **409 Conflict**: Resource conflict (e.g., foreign key constraints)
- **500 Internal Server Error**: Server error

### Example Error Response

```json
{
  "message": "Cannot delete category. It is being used by existing food items.",
  "details": "Category is used by 5 food item(s). Please move or delete these food items first.",
  "foodItems": [
    { "foodId": "1", "foodName": "Chicken Curry" },
    { "foodId": "2", "foodName": "Beef Steak" }
  ]
}
```

---

## Notes

1. All endpoints return JSON responses
2. Date/time fields are in ISO 8601 format (UTC)
3. All DELETE operations return detailed information about the deleted item
4. Constraint violations (foreign key dependencies) are handled gracefully with informative error messages
5. Authentication and authorization may be required for certain endpoints (implementation dependent)
6. Base URL may vary depending on deployment environment
