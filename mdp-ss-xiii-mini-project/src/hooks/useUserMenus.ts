"use client";

import { useState, useEffect } from 'react';
import { MenuWithChildren } from '@/lib/types';
import * as api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export const useUserMenus = () => {
  const [menus, setMenus] = useState<MenuWithChildren[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, role } = useAuth();

  useEffect(() => {
    const fetchUserMenus = async () => {
      if (!isAuthenticated || !role) {
        setMenus([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.getUserMenus();
        setMenus(response.menus || []);
      } catch (err) {
        console.error('Failed to fetch user menus:', err);
        setError(err instanceof Error ? err.message : 'Failed to load menus');
        setMenus([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserMenus();
  }, [isAuthenticated, role]);

  return { menus, loading, error };
};
