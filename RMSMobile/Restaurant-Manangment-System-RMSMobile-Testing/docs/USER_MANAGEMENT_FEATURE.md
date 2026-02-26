# User Management Feature

## Overview
The User Management screen allows administrators to view, edit, and manage all user accounts in the restaurant management system.

## Features
- **View All Users**: Display a comprehensive list of all users with their roles, contact information, and permissions
- **User Details**: Tap on any user to view detailed information
- **Edit Users**: Modify user information including name, role, phone, email, and permissions
- **Delete Users**: Remove users from the system (cannot delete your own account)
- **Role-based Access**: Only Admin users can access this screen
- **Pull to Refresh**: Refresh the user list by pulling down

## User Information Displayed
- Username
- Full Name
- Role (with color-coded badges)
- Phone Number
- Email Address
- User Rights/Permissions
- User ID

## Role Display
The screen displays different roles with color-coded badges:
- **Admin** (Red): Full system access
- **NV (Nhân viên)** (Blue): Staff member
- **TN (Thu ngân)** (Green): Cashier
- **Bep (Bếp)** (Orange): Kitchen staff
- **Customer** (Purple): Regular customer

## Access Control
- Only users with **Admin** role can access this screen
- The screen appears in the "Management" section of the sidebar menu
- Non-admin users won't see this option in their menu

## Usage
1. Open the app and ensure you're logged in as an Admin
2. Open the sidebar menu (hamburger button)
3. Find "Quản Lý Người Dùng" in the Management section
4. Tap to view all users
5. Tap on any user card to view/edit details
6. Use the edit button to modify user information
7. Use the delete button to remove users (except yourself)

## API Integration
The screen uses the following API endpoints:
- `GET /api/User` - Fetch all users
- `GET /api/User/{id}` - Get specific user details
- `PUT /api/User/{id}` - Update user information
- `DELETE /api/User/{id}` - Delete user

## Files Modified/Created
1. **Created**: `screens/UserManagementScreen.js` - Main screen component
2. **Modified**: `App.js` - Added route to stack navigator
3. **Modified**: `context/AuthContext.js` - Added to management menu items

## Dependencies
- React Native
- React Navigation
- Material Community Icons
- AsyncStorage (for user session)
- ApiService (for backend communication)
- Toast notifications for user feedback

## Security Features
- Role-based access control
- Cannot delete your own account
- Input validation for user updates
- Confirmation dialogs for destructive actions