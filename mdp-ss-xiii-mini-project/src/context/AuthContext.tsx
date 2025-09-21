// /src/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { jwtDecode } from 'jwt-decode';
import { User, Role, LoginRequest } from '@/lib/types';
import { getRoleBasedRoute, hasRoleAccess } from '@/utils/roleRoutes';
import * as api from '@/lib/api';
import { Spin } from 'antd';

interface JwtPayload {
  exp: number;
  iat: number;
  sub: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshAuthToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Public routes that don't require authentication - moved outside to avoid dependencies
  const publicRoutes = ['/auth/login', '/auth/google', '/auth/callback'];

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.logoutUser();
      }
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      // Clear all stored data
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      
      // Clear state
      setUser(null);
      setRole(null);
      
      // Redirect to login
      router.push('/auth/login');
    }
  }, [router]);

  const checkTokenExpiration = (token: string): boolean => {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;
      
      // Check if token will expire in the next 5 minutes (300 seconds)
      return decoded.exp < (currentTime + 300);
    } catch (error) {
      console.error('Error decoding token:', error);
      return true; // Consider invalid tokens as expired
    }
  };

  const refreshAuthToken = useCallback(async (): Promise<boolean> => {
    try {
      if (typeof window === 'undefined') {
        return false;
      }

      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.log('No refresh token available');
        return false;
      }

      console.log('Attempting to refresh token...');
      const response = await api.refreshToken({ refreshToken });
      
      // Update stored tokens and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('role', JSON.stringify(response.role));
      
      // Update state
      setUser(response.user);
      setRole(response.role);
      
      console.log('Token refreshed successfully');
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }, []);

  const validateAndLoadUser = useCallback(async () => {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log('No token found');
      setIsLoading(false);
      return;
    }

    try {
      // Check if token is expired or about to expire
      if (checkTokenExpiration(token)) {
        console.log('Token expired or expiring soon, attempting refresh...');
        
        const refreshed = await refreshAuthToken();
        if (!refreshed) {
          throw new Error('Token refresh failed');
        }
      } else {
        // Token is still valid, load user data from localStorage
        const storedUser = localStorage.getItem('user');
        const storedRole = localStorage.getItem('role');
        
        if (storedUser && storedRole) {
          setUser(JSON.parse(storedUser));
          setRole(JSON.parse(storedRole));
          console.log('User data loaded from localStorage');
        } else {
          // Try to fetch user profile if local data is missing
          try {
            const userProfile = await api.getProfile();
            setUser(userProfile.user);
            setRole(userProfile.role);
            localStorage.setItem('user', JSON.stringify(userProfile.user));
            localStorage.setItem('role', JSON.stringify(userProfile.role));
            console.log('User profile fetched from API');
          } catch (profileError) {
            console.error('Failed to fetch user profile:', profileError);
            throw profileError;
          }
        }
      }
      
    } catch (error) {
      console.error('Auth validation failed:', error);
      
      // Clear invalid tokens and user data
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      setUser(null);
      setRole(null);
    } finally {
      setIsLoading(false);
    }
  }, [refreshAuthToken]);

  const login = async (credentials: LoginRequest) => {
    console.log('AuthContext login called with:', credentials);
    try {
      const response = await api.loginUser(credentials);
      console.log('Login response:', response);
      
      // Store tokens and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('role', JSON.stringify(response.role));
      
      // Update state
      setUser(response.user);
      setRole(response.role);
      
      // FR-5.2.3.2: Sistem mengarahkan user ke halaman dashboard spesifik sesuai role
      const targetRoute = getRoleBasedRoute(response.role);
      console.log(`Redirecting ${response.role.name} to: ${targetRoute}`);
      router.push(targetRoute);
    } catch (error) {
      console.log('AuthContext login error:', error);
      throw error; // Re-throw the error so it can be caught by the login page
    }
  };

  // Handle authentication redirect logic
  useEffect(() => {
    if (!isLoading) {
      const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
      
      if (!user && !isPublicRoute) {
        // User is not authenticated and trying to access protected route
        console.log('Redirecting to login - no authentication');
        router.push('/auth/login');
      } else if (user && pathname === '/auth/login') {
        // User is authenticated but on login page, redirect to dashboard
        console.log('Redirecting to dashboard - already authenticated');
        const targetRoute = getRoleBasedRoute(role);
        router.push(targetRoute);
      } else if (user && !isPublicRoute && role) {
        // FR-5.2.3.1 & FR-5.2.3.2: Role-based access control
        const hasAccess = hasRoleAccess(role, pathname);
        if (!hasAccess) {
          console.warn(`Access denied for role ${role.name} to path ${pathname}`);
          // Redirect to role-appropriate dashboard
          const allowedRoute = getRoleBasedRoute(role);
          router.push(allowedRoute);
        }
      }
    }
  }, [user, role, isLoading, pathname, router]);

  // Initial auth check
  useEffect(() => {
    validateAndLoadUser();
  }, [validateAndLoadUser]);

  // Set up token refresh interval
  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      const intervalId = setInterval(async () => {
        const token = localStorage.getItem('token');
        if (token && checkTokenExpiration(token)) {
          console.log('Token expiring soon, refreshing...');
          const refreshed = await refreshAuthToken();
          if (!refreshed) {
            console.log('Auto-refresh failed, logging out');
            logout();
          }
        }
      }, 60000); // Check every minute

      return () => clearInterval(intervalId);
    }
  }, [user, refreshAuthToken, logout]);
  
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <Spin size="large" />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      role, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      logout, 
      refreshAuthToken 
    }}>
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