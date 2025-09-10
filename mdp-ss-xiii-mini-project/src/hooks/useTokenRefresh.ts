"use client";

import { useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import * as api from '@/lib/api';

const TOKEN_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const TOKEN_REFRESH_THRESHOLD = 2 * 60 * 1000; // Refresh if expires within 2 minutes

export const useTokenRefresh = () => {
  const { logout } = useAuth();

  const isTokenExpiringSoon = useCallback((token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiry = payload.exp * 1000; // Convert to milliseconds
      const now = Date.now();
      
      return (expiry - now) < TOKEN_REFRESH_THRESHOLD;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true; // Assume expired if we can't parse
    }
  }, []);

  const refreshTokenIfNeeded = useCallback(async () => {
    // Only proceed if we're in the browser and user is authenticated
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!token || !refreshToken) {
      return;
    }

    if (isTokenExpiringSoon(token)) {
      try {
        console.log('Token is expiring soon, refreshing...');
        await api.refreshToken({ refreshToken });
        console.log('Token refreshed successfully');
      } catch (error) {
        console.error('Failed to refresh token:', error);
        // If refresh fails, logout the user
        logout();
      }
    }
  }, [isTokenExpiringSoon, logout]);

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;
    
    // Check immediately when component mounts
    refreshTokenIfNeeded();

    // Set up periodic check
    const intervalId = setInterval(refreshTokenIfNeeded, TOKEN_CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [refreshTokenIfNeeded]);

  return { refreshTokenIfNeeded };
};
