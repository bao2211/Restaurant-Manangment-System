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
          setUser(JSON.parse(storedUser));
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

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      updateUserPassword, 
      updateUserInfo, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
