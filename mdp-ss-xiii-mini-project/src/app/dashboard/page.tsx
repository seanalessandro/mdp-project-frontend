"use client";

import React from "react";
import { Button, Card, Col, Row, Statistic, Table, Tag, Typography, Space, Avatar, Dropdown, MenuProps } from "antd";
import {
  FileTextOutlined,
  UserOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  UsergroupAddOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
  KeyOutlined
} from '@ant-design/icons';
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // <-- Gunakan useAuth

const { Title, Text } = Typography;

export default function DashboardPage() {
  const { user, role, logout } = useAuth(); // <-- Ambil user, role, dan fungsi logout dari context
  const router = useRouter();

  // Note: Logika untuk ChangePasswordModal dan data dinamis lainnya bisa ditambahkan di sini
  // Untuk saat ini, kita fokus pada tampilan dinamis berdasarkan role.

  const handleLogout = async () => {
    await logout(); // Gunakan fungsi logout dari context
  };

  const userMenuItems: MenuProps['items'] = [
    // ... bisa ditambahkan item menu lain jika perlu
    {
      key: 'change-password',
      icon: <KeyOutlined />,
      label: 'Change Password',
      // onClick: () => setChangePasswordVisible(true), // Anda perlu state untuk modal ini
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  const getAdminDashboard = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card variant="borderless"><Statistic title="Total Users" value={150} prefix={<UserOutlined />} /></Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card variant="borderless"><Statistic title="Active Sessions" value={42} prefix={<ClockCircleOutlined />} /></Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card variant="borderless"><Statistic title="System Reports" value={28} prefix={<BarChartOutlined />} /></Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card variant="borderless"><Statistic title="Configurations" value={12} prefix={<SettingOutlined />} /></Card>
      </Col>
      <Col xs={24}>
        <Card title="Quick Actions" className="mt-4">
          <Space wrap>
            <Button type="primary" icon={<UsergroupAddOutlined />} onClick={() => router.push('/dashboard/manage-users')}>Manage Users</Button>
            <Button icon={<SettingOutlined />} onClick={() => router.push('/dashboard/manage-roles')}>Manage Roles</Button>
          </Space>
        </Card>
      </Col>
    </Row>
  );

  const getEditorDashboard = () => (
    // Anda bisa membuat tampilan spesifik untuk role 'editor' di sini
    <Row gutter={[16, 16]}>
      <Col xs={24}><Card><Text>Dashboard for Editor</Text></Card></Col>
    </Row>
  );

  const getViewerDashboard = () => (
    // Tampilan untuk 'viewer' atau role lainnya
    <Row gutter={[16, 16]}>
      <Col xs={24}><Card><Text>Welcome! You have view-only access.</Text></Card></Col>
    </Row>
  );

  const getDashboardByRole = () => {
    // --- PERBAIKAN: Gunakan role.name dari context ---
    switch (role?.name) {
      case 'admin':
        return getAdminDashboard();
      case 'editor':
        return getEditorDashboard();
      default:
        return getViewerDashboard();
    }
  };

  return (
    <Space direction="vertical" size="large" style={{ display: 'flex' }}>
      <Row justify="space-between" align="middle">
        <Col>
          <Title level={2}>Dashboard</Title>
          <Text type="secondary">
            {user?.lastLogin ? `Last login: ${new Date(user.lastLogin).toLocaleString()}` : 'Welcome to your dashboard'}
          </Text>
        </Col>
        <Col>
          <Space size="middle">
            <Text>Welcome, <strong>{user?.username}</strong></Text>
            <Tag color="blue">{role?.name?.toUpperCase()}</Tag>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Avatar style={{ cursor: 'pointer' }} icon={<UserOutlined />} />
            </Dropdown>
          </Space>
        </Col>
      </Row>

      {getDashboardByRole()}
    </Space>
  );
}