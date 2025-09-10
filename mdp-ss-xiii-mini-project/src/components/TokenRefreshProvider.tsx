"use client";

import { useTokenRefresh } from '@/hooks/useTokenRefresh';

export const TokenRefreshProvider = ({ children }: { children: React.ReactNode }) => {
  // Always call the hook, it will handle authentication checks internally
  useTokenRefresh();

  return <>{children}</>;
};
