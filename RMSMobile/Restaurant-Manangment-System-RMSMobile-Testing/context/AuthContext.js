import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/apiService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(false);

  // Load user từ AsyncStorage khi mở 
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          
          // Set auth token if available
          if (userData.token) {
            apiService.setAuthToken(userData.token);
            console.log('🔑 JWT token restored from storage');
          }
          
          setUser(userData);
        }
      } catch (error) {
        console.log('Load user error:', error);
      }
    };
    loadUser();
  }, []);

  // Login function
  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await apiService.login({ username, password });
      if (response && response.userId) {
        // Set auth token if provided
        if (response.token) {
          apiService.setAuthToken(response.token);
          console.log('🔑 JWT token set for authenticated requests');
        }
        
        setUser(response);
        await AsyncStorage.setItem('user', JSON.stringify(response)); // Save user
        return true;
      } else {
        throw new Error('Sai thông tin đăng nhập');
      }
    } catch (error) {
      throw new Error(error?.detail || error.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    // Remove auth token
    apiService.setAuthToken(null);
    console.log('🚪 Auth token removed on logout');
    
    setUser(null);
    await AsyncStorage.removeItem('user'); // xóa user khi logout
  };

  // Update user password function
  const updateUserPassword = async (passwordData) => {
    setLoading(true);
    try {
      if (!user || !user.userId) {
        throw new Error('User không tồn tại hoặc chưa login');
      }

      const cleanUserId = user.userId.toString().trim();
      console.log('AuthContext - Updating password for userId:', `"${cleanUserId}"`);
      
      // First, get the current user data from the API to preserve existing values
      const currentUserData = await apiService.getUserById(cleanUserId);
      console.log('Current user data from API:', currentUserData);
      
      // Build complete update data with all required fields to avoid NULL constraint violations
      const updateData = {
        UserId: cleanUserId,
        UserName: currentUserData.UserName || currentUserData.userName || user.userName,
        Password: passwordData.newPassword, // Only update the password
        Role: currentUserData.Role || currentUserData.role || user.role || 'Staff', // Provide default role
        FullName: currentUserData.FullName || currentUserData.fullName || user.fullName || user.userName,
        Phone: currentUserData.Phone || currentUserData.phone || user.phone || 0,
        Email: currentUserData.Email || currentUserData.email || user.email || `${user.userName}@restaurant.com`,
        Right: currentUserData.Right || currentUserData.right || user.right || 'USER', // Provide default right to avoid NULL constraint
      };

      console.log('Sending password update data:', { ...updateData, password: '[HIDDEN]' });

      const updatedUserFromApi = await apiService.updateUser(cleanUserId, updateData);

      // API returns 204 No Content on successful update, so we use the current user data
      // and just update the password locally (but don't store it for security)
      const safeUser = { ...currentUserData };
      delete safeUser.password; // Remove password for security
      delete safeUser.Password; // Remove uppercase version too
      
      setUser(safeUser);
      await AsyncStorage.setItem('user', JSON.stringify(safeUser));
      
      console.log('Password updated successfully');
      return safeUser;
    } catch (error) {
      console.error('Password update error:', error);
      throw new Error(error?.message || 'Cập nhật mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Update user information function
  const updateUserInfo = async (updatedUserData) => {
    try {
      setUser(updatedUserData);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUserData));
      return updatedUserData;
    } catch (error) {
      console.error('Error updating user info in context:', error);
      throw error;
    }
  };

  // Complete user profile update function with API call
  const updateUserProfile = async (profileData) => {
    setLoading(true);
    try {
      if (!user || !user.userId) {
        throw new Error('User không tồn tại hoặc chưa login');
      }

      const cleanUserId = user.userId.toString().trim();
      console.log('AuthContext - Updating profile for userId:', `"${cleanUserId}"`);
      
      // Get current user data from API to preserve existing values
      const currentUserData = await apiService.getUserById(cleanUserId);
      console.log('Current user data from API:', currentUserData);
      
      // Build complete update data with all required fields
      const updateData = {
        UserId: cleanUserId,
        UserName: profileData.userName || currentUserData.UserName || user.userName,
        Password: currentUserData.Password || currentUserData.password, // Keep existing password
        Role: currentUserData.Role || currentUserData.role || user.role || 'Staff',
        FullName: profileData.fullName || currentUserData.FullName || user.fullName,
        Phone: profileData.phone || currentUserData.Phone || user.phone || '0',
        Email: profileData.email || currentUserData.Email || user.email || `${user.userName}@restaurant.com`,
        Right: currentUserData.Right || currentUserData.right || user.right || 'USER',
      };

      console.log('Sending profile update data:', { ...updateData, Password: '[HIDDEN]' });

      // Update user via API
      await apiService.updateUser(cleanUserId, updateData);

      // Create updated user object for context (without password)
      const updatedUser = {
        ...user,
        fullName: updateData.FullName,
        FullName: updateData.FullName,
        email: updateData.Email,
        Email: updateData.Email,
        phone: updateData.Phone,
        Phone: updateData.Phone,
        userName: updateData.UserName,
        UserName: updateData.UserName,
      };
      
      setUser(updatedUser);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      
      console.log('Profile updated successfully');
      return updatedUser;
    } catch (error) {
      console.error('Profile update error:', error);
      throw new Error(error?.message || 'Cập nhật thông tin thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Role-based access control functions
  const getUserRole = () => {
    return user?.role || user?.Role || 'Customer';
  };

  const hasAccessToScreen = (screenName) => {
    const userRole = getUserRole();
    console.log('Checking access for role:', userRole, 'to screen:', screenName);
    
    // Admin has access to everything
    if (userRole === 'Admin' || userRole === 'admin' || userRole === 'ADMIN') {
      return true;
    }

    // Define role permissions based on the requirements
    const rolePermissions = {
      'NV': ['Home', 'Table', 'Menu', 'Orders', 'OrderDetail', 'Profile'],
      'nv': ['Home', 'Table', 'Menu', 'Orders', 'OrderDetail', 'Profile'], // lowercase variant
      'TN': ['Home', 'Orders', 'BillManager', 'Profile'],
      'tn': ['Home', 'Orders', 'BillManager', 'Profile'], // lowercase variant
      'Bep': ['Home', 'Menu', 'OrderDetailManager', 'Profile'],
      'bep': ['Home', 'Menu', 'OrderDetailManager', 'Profile'], // lowercase variant
      'BEP': ['Home', 'Menu', 'OrderDetailManager', 'Profile'], // uppercase variant
      'Customer': ['Home', 'Menu', 'Profile'],
      'customer': ['Home', 'Menu', 'Profile'], // lowercase variant
      'CUSTOMER': ['Home', 'Menu', 'Profile'], // uppercase variant
    };

    const allowedScreens = rolePermissions[userRole] || ['Home', 'Profile']; // Default fallback
    const hasAccess = allowedScreens.includes(screenName);
    
    console.log(`Role ${userRole} access to ${screenName}: ${hasAccess ? 'GRANTED' : 'DENIED'}`);
    console.log(`Allowed screens for ${userRole}:`, allowedScreens);
    
    return hasAccess;
  };

  const getAccessibleMenuItems = () => {
    const userRole = getUserRole();
    console.log('Getting accessible menu items for role:', userRole);
    
    const allMenuItems = [
      { name: 'Home', icon: 'home', title: 'Home', screen: 'Home' },
      { name: 'Menu', icon: 'food', title: 'Our Menu', screen: 'Menu' },
      { name: 'Orders', icon: 'clipboard-list', title: 'My Orders', screen: 'Orders' },
      { name: 'OrderDetail', icon: 'clipboard-text', title: 'Order Details', screen: 'OrderDetail' },
      { name: 'Table', icon: 'table-chair', title: 'Our Table', screen: 'Table' },
      { name: 'BillManager', icon: 'cash-register', title: 'Bill Management', screen: 'BillManager' },
      { name: 'Report', icon: 'file-chart', title: 'Our Report', screen: 'Report' },
      { name: 'Profile', icon: 'account', title: 'My Profile', screen: 'Profile' },
    ];

    const managementItems = [
      { name: 'MenuManager', icon: 'silverware-fork-knife', title: 'Quản Lý Món Ăn', screen: 'MenuManager' },
      { name: 'IngredientManager', icon: 'package-variant', title: 'Quản Lý Nguyên Liệu', screen: 'IngredientManager' },
      { name: 'OrderDetailManager', icon: 'food-fork-drink', title: 'Trạng Thái Món Ăn', screen: 'OrderDetailManager' },
      { name: 'UserManagement', icon: 'account-group', title: 'Quản Lý Người Dùng', screen: 'UserManagement' },
    ];

    // Filter menu items based on role permissions
    const accessibleMainMenu = allMenuItems.filter(item => {
      const hasAccess = hasAccessToScreen(item.screen);
      console.log(`Menu item ${item.name} (${item.screen}) - Access: ${hasAccess ? 'YES' : 'NO'}`);
      return hasAccess;
    });
    
    const accessibleManagementMenu = managementItems.filter(item => {
      const hasAccess = hasAccessToScreen(item.screen);
      console.log(`Management item ${item.name} (${item.screen}) - Access: ${hasAccess ? 'YES' : 'NO'}`);
      return hasAccess;
    });

    console.log(`Final accessible items - Main: ${accessibleMainMenu.length}, Management: ${accessibleManagementMenu.length}`);

    return {
      mainMenu: accessibleMainMenu,
      managementMenu: accessibleManagementMenu
    };
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      updateUserPassword, 
      updateUserInfo, 
      updateUserProfile, 
      loading,
      getUserRole,
      hasAccessToScreen,
      getAccessibleMenuItems
    }}>
      {children}
    </AuthContext.Provider>
  );
};
