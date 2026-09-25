import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, pass: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Restore & verify authentication on initial app load / reload
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('prj533_token');

      if (!savedToken) {
        setToken(null);
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        setToken(savedToken);
        // Verify token & restore latest profile from backend GET /api/users/profile
        const activeUser = await authService.getProfile();
        setUser(activeUser);
        localStorage.setItem('prj533_user', JSON.stringify(activeUser));
      } catch {
        // Token invalid, expired, or server user deactivated
        localStorage.removeItem('prj533_token');
        localStorage.removeItem('prj533_user');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, pass);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('prj533_token', res.token);
      localStorage.setItem('prj533_user', JSON.stringify(res.user));
      return true;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    name: string,
    email: string,
    pass: string,
    role: UserRole
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const res = await authService.register(name, email, pass, role);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('prj533_token', res.token);
      localStorage.setItem('prj533_user', JSON.stringify(res.user));
      return true;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
    localStorage.removeItem('prj533_token');
    localStorage.removeItem('prj533_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
