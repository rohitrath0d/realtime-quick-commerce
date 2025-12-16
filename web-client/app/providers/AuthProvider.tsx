"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User } from '@/services/api';
import { connectSocket, disconnectSocket } from '@/services/socket';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ user: User; token: string }>;
  register: (data: { name: string; email: string; password: string; role: 'customer' | 'store' | 'delivery'; phone?: string }) => Promise<{ user: User; token: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // localStorage is only available on the client — read it inside useEffect
      const storedToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (storedToken) {
        try {
          const profileRes = await authApi.getProfile();
          const profile = profileRes?.user || profileRes;
          // Normalize role to lowercase and trim for frontend usage
          const normalized = { ...profile, role: String(profile.role).trim().toLowerCase() };
          setUser(normalized);
          setToken(storedToken);
        } catch (error) {
          console.error('Failed to fetch profile:', error);
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login(email, password);
    localStorage.setItem('token', response.token);
    setToken(response.token);
    const normalizedUser = { ...response.user, role: String(response.user.role).trim().toLowerCase() };
    setUser(normalizedUser);
    // Do not auto-connect socket here; dashboards will connect after role validation
    return { ...response, user: normalizedUser };
  };

  const register = async (data: { name: string; email: string; password: string; role: 'customer' | 'store' | 'delivery'; phone?: string }) => {
    const payload = { ...data, role: data.role.toUpperCase() };
    const response = await authApi.register(payload);
    localStorage.setItem('token', response.token);
    setToken(response.token);
    const normalizedUser = { ...response.user, role: String(response.user.role).trim().toLowerCase() };
    setUser(normalizedUser);
    return { ...response, user: normalizedUser };
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    disconnectSocket();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
