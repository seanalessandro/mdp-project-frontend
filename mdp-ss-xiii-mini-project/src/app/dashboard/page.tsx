"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { getDashboardComponent } from "@/utils/roleRoutes";
import AdminDashboard from "@/components/dashboard/AdminDashboard";
import EditorDashboard from "@/components/dashboard/EditorDashboard";
import ReviewerDashboard from "@/components/dashboard/ReviewerDashboard";
import ApproverDashboard from "@/components/dashboard/ApproverDashboard";
import { Card, Typography, Spin } from "antd";

const { Title } = Typography;

// Default dashboard for unknown roles
function DefaultDashboard() {
  const { user, role } = useAuth();
  
  return (
    <Card>
      <Title level={2}>Welcome, {user?.username}!</Title>
      <p>Role: {role?.name}</p>
      <p>Your dashboard is being prepared...</p>
    </Card>
  );
}

export default function DashboardPage() {
  const { user, role, isLoading } = useAuth();

  // Show loading spinner while checking authentication
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
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // This check is now mainly for TypeScript, as redirect is handled in AuthContext
  if (!user || !role) {
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
        <p>Authenticating...</p>
      </div>
    );
  }

  // FR-5.2.3.1: Sistem harus mengidentifikasi role user setelah login
  const dashboardComponent = getDashboardComponent(role);
  
  // FR-5.2.3.2: Sistem mengarahkan user ke halaman dashboard spesifik sesuai role
  const renderRoleBasedDashboard = () => {
    switch (dashboardComponent) {
      case 'AdminDashboard':
        return <AdminDashboard />;
      case 'EditorDashboard':
        return <EditorDashboard />;
      case 'ReviewerDashboard':
        return <ReviewerDashboard />;
      case 'ApproverDashboard':
        return <ApproverDashboard role={role.name} />;
      default:
        return <DefaultDashboard />;
    }
  };

  return renderRoleBasedDashboard();
}