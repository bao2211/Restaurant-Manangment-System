import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/apiService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); 
  const [loading, setLoading] = useState(false);

  // Load user từ AsyncStorage khi mở app
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
      const response = await apiService.login({ 
        userName: username,
        password: password 
      });
      
      if (response && response.userId) {
        // Clean userId to remove any trailing spaces
        const cleanedResponse = {
          ...response,
          userId: response.userId.toString().trim()
        };
        
        setUser(cleanedResponse);
        await AsyncStorage.setItem('user', JSON.stringify(cleanedResponse));

        // Fetch full user để lấy info updated (email nếu có)
        try {
          const fullUser = await apiService.getUserById(cleanedResponse.userId);
          if (fullUser) {
            // Clean the full user data too
            const cleanedFullUser = {
              ...cleanedResponse,
              ...fullUser,
              userId: fullUser.userId ? fullUser.userId.toString().trim() : cleanedResponse.userId
            };
            setUser(cleanedFullUser);
            await AsyncStorage.setItem('user', JSON.stringify(cleanedFullUser));
          }
        } catch (fetchError) {
          console.log('Could not fetch full user details, using login response:', fetchError);
          // Continue with just the login response if full user fetch fails
        }

        return true;
      } else {
        throw new Error('Sai thông tin đăng nhập');
      }
    } catch (error) {
      console.error('Login error details:', error);
      if (error.response && error.response.status === 401) {
        throw new Error('Sai tên đăng nhập hoặc mật khẩu');
      }
      throw new Error(error?.response?.data?.message || error?.detail || error.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Register function (mới thêm)
  const register = async (registerData) => {
    setLoading(true);
    try {
      // Generate userId nếu không có (hoặc để backend handle nếu possible, nhưng theo doc cần send)
      const userId = registerData.userId || `user_${Date.now()}`; // Temporary unique ID
      
      const createData = {
        userId,
        userName: registerData.username,
        password: registerData.password,
        role: registerData.role || "Staff", // Default role
        fullName: registerData.fullName,
        email: registerData.email,
      };

      const response = await apiService.createUser(createData); // Sử dụng method createUser đã thêm trong apiService
      
      if (response) {
        // Auto login sau register
        await login(registerData.username, registerData.password);
        return true;
      } else {
        throw new Error('Đăng ký thất bại');
      }
    } catch (error) {
      console.error('Register error:', error);
      throw new Error(error?.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem('user');
  };

  // Update user information (không thay đổi mật khẩu)
  const updateUserInfo = async (updatedUserData) => {
    try {
      // Cập nhật user trong context và storage
      setUser(updatedUserData);
      await AsyncStorage.setItem('user', JSON.stringify(updatedUserData));
      return updatedUserData;
    } catch (error) {
      console.error('Error updating user info in context:', error);
      throw error;
    }
  };

  // Update user password (chỉ thay đổi mật khẩu, không lưu password vào storage)
  const updateUserPassword = async (newPasswordData) => {
    setLoading(true);
    try {
      if (!user || !user.userId) {
        throw new Error('User không tồn tại hoặc chưa login');
      }

      const cleanUserId = user.userId.trim();
      console.log('AuthContext - Updating password for userId:', `"${cleanUserId}"`);
      const updateData = {
        userId: cleanUserId,
        userName: user.userName,
        password: newPasswordData.newPassword, // Mật khẩu mới (API sẽ hash ở server)
        role: user.role,
        fullName: user.fullName,
        email: user.email,
      };

      console.log('Sending password update data:', { ...updateData, password: '[HIDDEN]' });

      const updatedUserFromApi = await apiService.updateUser(cleanUserId, updateData);

      if (updatedUserFromApi) {
        // KHÔNG add password vào vì đổi password riêng
        setUser(updatedUserFromApi);
        await AsyncStorage.setItem('user', JSON.stringify(updatedUserFromApi));
        return updatedUserFromApi;
      } else {
        throw new Error('Cập nhật mật khẩu thất bại');
      }
    } catch (error) {
      console.error('Password update error:', error);
      throw new Error(error?.message || 'Cập nhật mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  // Legacy updateUser function - deprecated, use updateUserInfo hoặc updateUserPassword
  const updateUser = async (updatedData) => {
    setLoading(true);
    try {
      if (!user || !user.userId) {
        throw new Error('User không tồn tại hoặc chưa login');
      }

      const cleanUserId = user.userId.trim();
      console.log('AuthContext - Using clean userId:', `"${cleanUserId}"`);

      // Chỉ gửi fields hợp lệ, loại bỏ extra như phone/right
      const cleanUpdatedData = {
        userId: cleanUserId,
        userName: updatedData.userName || user.userName,
        ...(updatedData.password && { password: updatedData.password }), 
        role: updatedData.role || user.role,
        fullName: updatedData.fullName || user.fullName,
        email: updatedData.email || user.email,
      };

      const updatedUserFromApi = await apiService.updateUser(cleanUserId, cleanUpdatedData);

      if (updatedUserFromApi) {
        const safeUser = { ...updatedUserFromApi };
        delete safeUser.password; 
        await AsyncStorage.setItem('user', JSON.stringify(safeUser));
        return safeUser;
      } else {
        throw new Error('Update thất bại');
      }
    } catch (error) {
      throw new Error(error?.message || 'Cập nhật thông tin thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login,
      register, 
      logout, 
      updateUser, 
      updateUserInfo, 
      updateUserPassword, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};