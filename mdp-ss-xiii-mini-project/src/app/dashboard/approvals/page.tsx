"use client";

import { useAuth } from '@/context/AuthContext';
import ApproverDashboard from '@/components/dashboard/ApproverDashboard';

export default function ApprovalsPage() {
  const { user, role } = useAuth();

  if (!user || !role) {
    return <div>Loading...</div>;
  }

  return <ApproverDashboard role={role.name} />;
}
