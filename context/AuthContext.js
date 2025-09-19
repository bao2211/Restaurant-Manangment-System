import React, { createContext, useState, useEffect } from 'react';
import { apiService } from '../services/apiService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // user info
  const [loading, setLoading] = useState(false);

  // Login function
  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await apiService.login({ username, password });
      if (response && response.userId) {
        setUser(response); // JSON từ backend
        setLoading(false);
        return true;
      } else {
        setLoading(false);
        throw new Error('Sai thông tin đăng nhập');
      }
    } catch (error) {
      setLoading(false);
      throw new Error(error?.detail || error.message || 'Đăng nhập thất bại');
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
