import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { ProfileResponse } from '../types/api';
import { apiClient } from '../services/apiClient';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: ProfileResponse | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<ProfileResponse | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const hasToken = apiClient.loadTokenFromStorage();
        if (hasToken) {
          const profile = await apiClient.getProfile();
          setUser(profile);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        apiClient.clearToken();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      await apiClient.login({ username, password });
      const profile = await apiClient.getProfile();
      setUser(profile);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    apiClient.clearToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  const refreshProfile = async () => {
    try {
      const profile = await apiClient.getProfile();
      setUser(profile);
    } catch (error) {
      console.error('Failed to refresh profile:', error);
      logout();
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    login,
    logout,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
