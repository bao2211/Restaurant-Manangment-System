"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

export interface UserInfo {
  userId: string;
  userName: string;
  fullName?: string;
  email?: string;
  role?: string;
  phone?: number;
  address?: string;
}

interface AuthContextType {
  user: UserInfo | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, fullName: string, email?: string, phone?: string, address?: string) => Promise<boolean>;
  updateUser: (updates: Partial<UserInfo>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://192.168.192.85:8080";
const AUTH_KEY = "rms_auth_user";

function getStoredUser(): UserInfo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(getStoredUser);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_KEY);
    }
  }, [user]);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/User/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName: username, password }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      const u: UserInfo = {
        userId: data.userId,
        userName: data.userName,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        phone: data.phone,
        address: data.address,
      };
      setUser(u);
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (
    username: string, password: string, fullName: string, email?: string, phone?: string, address?: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/User`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: `USR${Date.now()}`.slice(0, 10),
          userName: username,
          password,
          fullName,
          email: email || "",
          phone: phone ? parseInt(phone) : null,
          address: address || "",
          role: "Customer",
        }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      const u: UserInfo = {
        userId: data.userId,
        userName: data.userName,
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        phone: data.phone,
        address: data.address,
      };
      setUser(u);
      return true;
    } catch {
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => setUser(null), []);

  const updateUser = useCallback((updates: Partial<UserInfo>) => {
    setUser((prev) => prev ? { ...prev, ...updates } : null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}