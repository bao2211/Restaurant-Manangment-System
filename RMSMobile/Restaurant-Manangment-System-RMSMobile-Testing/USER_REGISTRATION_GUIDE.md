# User Registration Feature - Implementation Guide

## Overview
This document describes the comprehensive user registration feature implemented in the Restaurant Management System mobile app, allowing users to create new accounts with full validation and notification support.

## 🎉 Features Implemented

### 1. RegisterScreen Component
- **Location**: `screens/RegisterScreen.js`
- **Purpose**: Complete user registration with form validation and API integration
- **Features**:
  - Comprehensive form validation
  - Password strength requirements
  - Real-time error checking
  - Loading states during registration
  - Success/error notifications with haptic feedback
  - Auto-login after successful registration
  - Professional UI design matching app theme

### 2. Enhanced ProfileScreen
- **Location**: `screens/ProfileScreen.js`
- **New Features**:
  - Enhanced Register button with toast notification (for non-logged-in users)
  - "Create New Account" button for logged-in users (to help create accounts for others)
  - Toast notifications when navigating to registration

### 3. Navigation Integration
- **Location**: `App.js`
- **Changes**:
  - Added `RegisterScreen` import and routes
  - Integrated with existing navigation structure
  - Works from both ProfileStack and MainAppStack

### 4. API Integration
- **Uses**: `apiService.createUser()` function
- **Features**:
  - Complete user data validation
  - Error handling for duplicate usernames
  - Network error handling
  - Success confirmation

## 📱 User Registration Flow

### For Non-Logged-In Users:
1. **Access**: User sees "Register" button on Profile screen
2. **Navigation**: Tap Register → Toast notification → Navigate to RegisterScreen
3. **Form**: Fill out registration form with validation
4. **Submit**: Create account with API call
5. **Success**: Success notification + auto-login option
6. **Result**: User is logged in and navigated to Home

### For Logged-In Users:
1. **Access**: User sees "Create New Account" button in Profile
2. **Purpose**: Create accounts for staff members or colleagues
3. **Flow**: Same registration process but returns to Profile after completion

## 🔧 Form Validation Rules

### Required Fields
- **Username** (`userName`):
  - Minimum 3 characters
  - Alphanumeric characters and underscores only
  - Cannot be empty
  
- **Full Name** (`fullName`):
  - Minimum 2 characters
  - Cannot be empty
  
- **Password** (`password`):
  - Minimum 6 characters
  - Must contain: 1 uppercase, 1 lowercase, 1 number
  - Cannot be empty
  
- **Confirm Password** (`confirmPassword`):
  - Must match the password field
  - Cannot be empty

### Optional Fields
- **Email** (`email`):
  - Must be valid email format if provided
  - Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
  
- **Phone** (`phone`):
  - Must be 10-11 digits if provided
  - Regex: `/^[0-9]{10,11}$/`

### Default Values
- **Role**: `'Staff'` (default for new users)
- **Rights**: `'USER'` (default permissions)
- **Email**: Auto-generated if not provided: `{username}@restaurant.com`
- **Phone**: `'0'` if not provided

## 🎯 Validation Features

### Real-Time Validation
- Errors appear immediately when user leaves a field
- Errors clear when user starts typing corrections
- Visual indicators (red borders, error text)
- Password strength hints

### Password Security
- **Show/Hide Password**: Eye icons for both password fields
- **Strength Requirements**: Clear requirements displayed
- **Confirmation Matching**: Real-time password match validation

### User Experience
- **Loading States**: Spinner during registration
- **Disabled States**: Buttons disabled during processing
- **Visual Feedback**: Color-coded error states

## 🔔 Notification System

### Success Notifications
- **Haptic Feedback**: Success vibration pattern `[0, 100, 50, 100]`
- **Toast Notification**: Modern green toast with user's name and action button
- **Detailed Alert**: Comprehensive success information with navigation options
- **Auto-Login**: Option to automatically log in the new user

### Error Notifications
- **Haptic Feedback**: Single error vibration (200ms)
- **Toast Notification**: Red error toast with retry action
- **Detailed Alert**: Comprehensive error information with troubleshooting tips
- **Retry Functionality**: Easy retry from both toast and alert

### Info Notifications
- **Navigation Hints**: Toast notifications when navigating to registration
- **Feature Explanations**: Helpful context for users

## 🎨 UI/UX Features

### Visual Design
- **Theme Consistency**: Matches app's color scheme and design patterns
- **Professional Layout**: Card-based form design with proper spacing
- **Icon Integration**: MaterialCommunityIcons for visual clarity
- **Responsive Design**: Proper handling of different screen sizes

### User Experience
- **Welcome Section**: Clear introduction with icon and explanation
- **Form Organization**: Logical field ordering and grouping
- **Action Buttons**: Clear primary and secondary actions
- **Navigation**: Easy access to login for existing users

### Accessibility
- **Clear Labels**: Descriptive field labels and placeholders
- **Error Messages**: Specific, helpful error messages
- **Visual Hierarchy**: Proper typography and spacing
- **Touch Targets**: Appropriately sized buttons and inputs

## 🔄 Registration Process

### API Call Flow
```javascript
const userData = {
  UserName: formData.userName.trim(),
  Password: formData.password,
  FullName: formData.fullName.trim(),
  Email: formData.email.trim() || `${formData.userName.trim()}@restaurant.com`,
  Phone: formData.phone.trim() || '0',
  Role: 'Staff',
  Right: 'USER',
};

const response = await apiService.createUser(userData);
```

### Success Flow
1. **API Success** → Vibration feedback
2. **Toast Notification** → 5-second duration with action button
3. **Detailed Alert** → User choice: Home or Auto-login
4. **Auto-Login** → If chosen, automatically log in the new user
5. **Navigation** → Redirect to appropriate screen

### Error Handling
1. **API Error** → Parse error message
2. **Error Classification**:
   - Duplicate username → Specific message
   - Network error → Connection guidance
   - Generic error → Fallback message
3. **User Feedback** → Toast + detailed alert with retry options

## 📍 Access Points

### 1. Non-Logged-In Users
- **Location**: Profile screen when not logged in
- **Button**: "Register" button below login button
- **Context**: Primary registration path for new users

### 2. Logged-In Users
- **Location**: Profile screen in "Account Management" section
- **Button**: "Create New Account" (purple button)
- **Context**: For creating accounts for staff/colleagues

### 3. Login Screen
- **Future Enhancement**: Link from login screen for easy access

## 🧪 Testing Guidelines

### Manual Testing Checklist
- [ ] Registration form loads with all fields
- [ ] Validation works for all required fields
- [ ] Password strength validation works
- [ ] Confirm password matching works
- [ ] Email format validation works
- [ ] Phone format validation works
- [ ] Success flow works end-to-end
- [ ] Error handling works for network issues
- [ ] Error handling works for duplicate usernames
- [ ] Toast notifications appear correctly
- [ ] Auto-login functionality works
- [ ] Navigation works from all access points

### Test Scenarios

#### Valid Registration
```
Username: testuser123
Password: Test123456
Confirm: Test123456
Full Name: Test User
Email: test@example.com
Phone: 0123456789
Expected: Success → Toast → Alert → Auto-login option
```

#### Invalid Registration - Weak Password
```
Username: testuser
Password: 123
Expected: Password validation error
```

#### Invalid Registration - Duplicate Username
```
Username: admin (existing user)
Expected: Duplicate username error
```

#### Invalid Registration - Mismatched Passwords
```
Password: Test123456
Confirm: Test123457
Expected: Password confirmation error
```

## 🛠️ Technical Implementation

### State Management
```javascript
const [formData, setFormData] = useState({
  userName: '',
  password: '',
  confirmPassword: '',
  fullName: '',
  email: '',
  phone: '',
});
const [errors, setErrors] = useState({});
const [isRegistering, setIsRegistering] = useState(false);
```

### Context Integration
```javascript
const { login } = useContext(AuthContext);
const { showSuccess, showError, showWarning } = useToast();
```

### Form Validation
- **Real-time validation** on field blur
- **Submit validation** before API call
- **Error state management** with visual indicators
- **Password security** requirements enforcement

## 🔒 Security Considerations

### Password Requirements
- Minimum 6 characters
- Must contain uppercase, lowercase, and number
- Secure input (hidden by default)
- Confirmation required

### Data Validation
- Username format validation
- Email format validation
- Phone number format validation
- Trim whitespace from inputs

### API Security
- Password not logged or displayed
- Proper error message handling
- Network timeout handling

## 🚀 Future Enhancements

### Additional Features
- Email verification process
- Phone number verification
- Profile picture upload during registration
- Terms of service acceptance
- Multi-step registration wizard
- Social login integration

### Admin Features
- User role selection during creation
- Department/location assignment
- Custom permission settings
- Bulk user creation
- User invitation system

### Enhanced Validation
- Real-time username availability check
- Password strength meter
- Suggested usernames
- Email domain validation
- International phone number support

## 📊 Error Messages

### Username Errors
- `"Tên đăng nhập không được để trống"`
- `"Tên đăng nhập phải có ít nhất 3 ký tự"`
- `"Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới"`
- `"Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác."`

### Password Errors
- `"Mật khẩu không được để trống"`
- `"Mật khẩu phải có ít nhất 6 ký tự"`
- `"Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số"`
- `"Mật khẩu xác nhận không khớp"`

### Network Errors
- `"Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại."`
- `"Server đang bận. Vui lòng thử lại sau."`

## 📂 File Structure
```
screens/
  ├── RegisterScreen.js          (New registration component)
  ├── ProfileScreen.js           (Enhanced with registration buttons)
  └── LoginScreen.js             (Existing, can link to registration)
context/
  ├── AuthContext.js            (Existing login functionality)
  └── ToastContext.js           (Notification system)
services/
  └── apiService.js             (createUser API function)
App.js                          (Navigation routes added)
```

## 🎯 Success Metrics

The registration feature provides:
- **Complete user onboarding** process
- **Professional user experience** with validation and feedback
- **Multiple access points** for different user types
- **Comprehensive error handling** with helpful messages
- **Modern notification system** with haptic feedback
- **Seamless integration** with existing authentication system

This implementation creates a robust, user-friendly registration system that enhances the overall app experience and makes it easy for new users to join the Restaurant Management System! 🚀