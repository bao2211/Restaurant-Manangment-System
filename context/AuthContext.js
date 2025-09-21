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

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
