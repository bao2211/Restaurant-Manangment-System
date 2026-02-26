# Ingredient Management Feature

## Overview
The Ingredient Management screen allows Admin and Kitchen (Bep) users to view and manage all ingredients information in the restaurant management system.

## Features
- **View All Ingredients**: Display a comprehensive list of all ingredients with stock levels, units, and descriptions
- **Search Functionality**: Search ingredients by name, description, or unit
- **Stock Status Indicators**: Color-coded status badges showing stock levels:
  - 🔴 **Red (Hết hàng)**: Stock = 0
  - 🟠 **Orange (Sắp hết)**: Stock < 10
  - 🟡 **Yellow (Còn ít)**: Stock < 50
  - 🟢 **Green (Đầy đủ)**: Stock >= 50
- **Ingredient Details**: Tap on any ingredient to view detailed information
- **Edit Ingredients**: Modify ingredient information (Name, Stock, Unit, Description)
- **Pull to Refresh**: Refresh the ingredient list by pulling down

## Ingredient Information Displayed
- Ingredient Name (ingreName)
- Stock Quantity with status indicator
- Unit of Measurement (unitMeasurement)
- Description (if available)
- Ingredient ID (ingreId)

## Access Control
- Only users with **Admin** or **Bep** (Kitchen) roles can access this screen
- The screen appears in the "Management" section of the sidebar menu
- Other roles won't see this option in their menu

## Usage
1. Open the app and ensure you're logged in as Admin or Bep user
2. Open the sidebar menu (hamburger button)
3. Find "Quản Lý Nguyên Liệu" in the Management section
4. Tap to view all ingredients
5. Use the search bar to find specific ingredients
6. Tap on any ingredient card to view/edit details
7. Use the edit button to modify ingredient information

## Stock Management
The screen provides visual indicators for stock levels:
- **Hết hàng (Out of Stock)**: Red badge with alert icon
- **Sắp hết (Low Stock)**: Orange badge with warning icon
- **Còn ít (Medium Stock)**: Yellow badge with info icon
- **Đầy đủ (Full Stock)**: Green badge with check icon

## API Integration
The screen uses the following API endpoints:
- `GET /api/Ingredient` - Fetch all ingredients
- `PUT /api/Ingredient/{id}` - Update ingredient information (planned)

## Files Created/Modified
1. **Created**: `screens/IngredientManagementScreen.js` - Main screen component
2. **Modified**: `App.js` - Added route to stack navigator
3. **Modified**: `context/AuthContext.js` - Added to management menu items and role permissions

## Role Permissions Updated
- **Admin**: Full access to all features including ingredient management
- **Bep/bep/BEP**: Access to ingredient management for kitchen operations
- **Other roles**: No access to ingredient management

## Dependencies
- React Native
- React Navigation
- Material Community Icons
- ApiService (for backend communication)
- Toast notifications for user feedback

## Data Structure
The ingredient data from API contains:
```json
{
  "ingreId": "1",
  "ingreName": "Gạo",
  "stock": 30,
  "unitMeasurement": "kg",
  "recipeDetails": []
}
```

## Future Enhancements
- Add ingredient creation functionality
- Implement ingredient deletion
- Add recipe details view
- Integrate with purchase orders
- Add stock alerts and notifications
- Export ingredient reports