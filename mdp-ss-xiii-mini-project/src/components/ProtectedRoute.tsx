"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Spin } from "antd";
import { AuthManager } from "../utils/auth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      if (!AuthManager.isAuthenticated()) {
        router.push('/login');
        return;
      }

      if (allowedRoles && allowedRoles.length > 0) {
        if (!AuthManager.hasAnyRole(allowedRoles)) {
          router.push('/dashboard'); // Redirect to dashboard if no permission
          return;
        }
      }

      setAuthorized(true);
      setLoading(false);
    };

    checkAuth();
  }, [router, allowedRoles]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!authorized) {
    return null;
  }

  return <>{children}</>;
}
