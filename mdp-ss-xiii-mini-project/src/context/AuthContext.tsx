// /src/context/AuthContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { User, Role, LoginRequest } from '@/lib/types';
import { getRoleBasedRoute, hasRoleAccess } from '@/utils/roleRoutes';
import * as api from '@/lib/api';
import { Spin } from 'antd';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const storedRole = localStorage.getItem('role');

    if (storedToken && storedUser && storedRole) {
      setUser(JSON.parse(storedUser));
      setRole(JSON.parse(storedRole));
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: LoginRequest) => {
    console.log('AuthContext login called with:', credentials);
    try {
      const response = await api.loginUser(credentials);
      console.log('Login response:', response);
      setUser(response.user);
      setRole(response.role);
      localStorage.setItem('user', JSON.stringify(response.user));
      localStorage.setItem('role', JSON.stringify(response.role));
      localStorage.setItem('token', response.token);
      
      // FR-5.2.3.2: Sistem mengarahkan user ke halaman dashboard spesifik sesuai role
      const targetRoute = getRoleBasedRoute(response.role);
      console.log(`Redirecting ${response.role.name} to: ${targetRoute}`);
      router.push(targetRoute);
    } catch (error) {
      console.log('AuthContext login error:', error);
      throw error; // Re-throw the error so it can be caught by the login page
    }
  };

  const logout = async () => {
    try {
      await api.logoutUser();
    } catch (error) {
      console.error("Logout API failed, proceeding with client-side logout.", error);
    } finally {
      setUser(null);
      setRole(null);
      localStorage.removeItem('user');
      localStorage.removeItem('role');
      localStorage.removeItem('token');
      router.push('/auth/login');
    }
  };

  useEffect(() => {
    if (isLoading) return;
    
    const isAuthPage = pathname.startsWith('/auth');
    const isAuthenticated = !!localStorage.getItem('token');
    const storedRole = localStorage.getItem('role');
    const currentRole = storedRole ? JSON.parse(storedRole) : null;

    if (!isAuthenticated && !isAuthPage) {
      router.push('/auth/login');
      return;
    }
    
    if (isAuthenticated && isAuthPage) {
      // Redirect authenticated users away from auth pages
      const targetRoute = getRoleBasedRoute(currentRole);
      router.push(targetRoute);
      return;
    }

    // FR-5.2.3.1 & FR-5.2.3.2: Role-based access control
    if (isAuthenticated && !isAuthPage && currentRole) {
      const hasAccess = hasRoleAccess(currentRole, pathname);
      if (!hasAccess) {
        console.warn(`Access denied for role ${currentRole.name} to path ${pathname}`);
        // Redirect to role-appropriate dashboard
        const allowedRoute = getRoleBasedRoute(currentRole);
        router.push(allowedRoute);
      }
    }
  }, [isLoading, pathname, router]);
  
  if (isLoading) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Spin size="large" /></div>;
  }

  return (
    <AuthContext.Provider value={{ user, role, isAuthenticated: !!user, isLoading, login, logout }}>
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