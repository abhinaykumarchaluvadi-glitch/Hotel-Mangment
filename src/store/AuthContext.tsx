import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from '../types';
import { authApi } from '../api/auth';
import type { LoginFormData, RegisterFormData } from '../schemas/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize and check for existing session
  useEffect(() => {
    const fetchSession = async () => {
      const token = localStorage.getItem('hms_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const currentUser = await authApi.getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        console.error('Session recovery failed:', err);
        // Clear corrupt session credentials
        localStorage.removeItem('hms_token');
      } finally {
        setLoading(false);
      }
    };

    fetchSession();
  }, []);

  const login = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const response = await authApi.login(data);
      localStorage.setItem('hms_token', response.token);
      setUser(response.user);
    } catch (err) {
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      const response = await authApi.register(data);
      localStorage.setItem('hms_token', response.token);
      setUser(response.user);
    } catch (err) {
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('hms_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
