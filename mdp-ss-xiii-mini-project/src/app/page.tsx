"use client";

import React, { useState, useEffect } from 'react';
import { Button, Card, Col, Row, Statistic, Table, Tag, Typography, Space, Avatar, List } from 'antd';
import {
  FileTextOutlined,
  UserOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  UsergroupAddOutlined,
  BarChartOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import type { ButtonType } from 'antd/es/button';

// --- Ant Design Components ---
const { Title, Text, Paragraph } = Typography;

// --- TypeScript Interfaces ---
interface Document {
  key: string;
  name: string;
  status: 'Completed' | 'In Progress' | 'Pending Review';
  lastModified: string;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

// --- Main Dashboard Page Component ---
// Mengganti nama dari App menjadi DashboardPage agar lebih deskriptif
export default function DashboardPage() {
  // --- State Management ---
  const [user] = useState({ name: "Master User", role: "Administrator" });
  const [isClient, setIsClient] = useState(false);

  // Mengatasi hydration error dengan memastikan render hanya terjadi di client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- Data Definitions ---
  const recentDocuments: Document[] = [
    { key: '1', name: 'User Management System BRD', status: 'Completed', lastModified: '2 hours ago' },
    { key: '2', name: 'Payment Gateway Integration', status: 'In Progress', lastModified: '1 day ago' },
    { key: '3', name: 'Mobile App Requirements', status: 'Pending Review', lastModified: '3 days ago' },
    { key: '4', name: 'API Documentation V2', status: 'Completed', lastModified: '5 days ago' },
  ];

  const quickActions = [
      { text: 'New Document', icon: <PlusOutlined />, onClick: () => console.log('New Document') },
      { text: 'Manage Users', icon: <UsergroupAddOutlined />, onClick: () => console.log('Manage Users') },
      { text: 'View Reports', icon: <BarChartOutlined />, onClick: () => console.log('View Reports') },
      { text: 'Settings', icon: <SettingOutlined />, onClick: () => console.log('Settings') },
  ];

  // --- Table Column Definitions ---
  const columns = [
    {
      title: 'Document Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: Document['status']) => {
        const colorMap = {
          Completed: 'success',
          'In Progress': 'processing',
          'Pending Review': 'error',
        };
        return <Tag color={colorMap[status]} className="font-semibold">{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: 'Last Modified',
      dataIndex: 'lastModified',
      key: 'lastModified',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Document) => (
        <Button type="link" className="font-semibold">
          {record.status === 'Completed' ? 'View' : record.status === 'In Progress' ? 'Edit' : 'Review'}
        </Button>
      ),
    },
  ];

  // --- Reusable Child Components ---
  const StatCard = ({ title, value, icon, color }: StatCardProps) => (
    <Card bordered={false} className="shadow-sm hover:shadow-lg transition-shadow rounded-xl h-full">
      <Statistic
        title={<Text type="secondary">{title}</Text>}
        value={value}
        valueStyle={{ color, fontWeight: 'bold' }}
        prefix={<div className="text-2xl mr-3">{icon}</div>}
      />
    </Card>
  );

  // --- Render Null on Server/Initial Hydration ---
  if (!isClient) {
    return null; // Mencegah hydration mismatch
  }

  // --- Render JSX on Client ---
  // Komponen ini sekarang hanya mengembalikan konten dasbor, tanpa Layout atau Header.
  return (
    <Space direction="vertical" size="large" className="w-full">
      
      {/* --- Welcome Card --- */}
      <Card bordered={false} className="rounded-xl shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50">
        <Row align="middle" gutter={[16, 16]}>
          <Col>
            <Avatar size={64} icon={<UserOutlined />} className="bg-blue-100 text-blue-600" />
          </Col>
          <Col>
            <Title level={3} className="!mb-0">Welcome back, {user.name}!</Title>
            <Paragraph type="secondary" className="!mb-0 text-base">Here's your dashboard overview for today.</Paragraph>
          </Col>
        </Row>
      </Card>

      {/* --- Stats Cards --- */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} lg={8}>
          <StatCard title="Total Documents" value={24} icon={<FileTextOutlined className="text-blue-500"/>} color="#1890ff" />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard title="Active Users" value={12} icon={<UserOutlined className="text-green-500"/>} color="#52c41a" />
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <StatCard title="Pending Reviews" value={7} icon={<ClockCircleOutlined className="text-orange-500"/>} color="#faad14" />
        </Col>
      </Row>

      {/* --- Quick Actions & Recent Documents in a Row --- */}
      <Row gutter={[24, 24]} align="stretch">
        {/* --- Quick Actions --- */}
        <Col xs={24} lg={8}>
            <Card title={<Title level={5} className="!font-bold">Quick Actions</Title>} bordered={false} className="shadow-sm hover:shadow-lg transition-shadow rounded-xl h-full">
                <List
                    itemLayout="horizontal"
                    dataSource={quickActions}
                    renderItem={(item) => (
                        <List.Item>
                            <Button type="text" icon={item.icon} size="large" onClick={item.onClick} className="w-full text-left justify-start">
                                {item.text}
                            </Button>
                        </List.Item>
                    )}
                />
            </Card>
        </Col>
        
        {/* --- Recent Documents --- */}
        <Col xs={24} lg={16}>
            <Card title={<Title level={5} className="!font-bold">Recent Documents</Title>} bordered={false} className="shadow-sm hover:shadow-lg transition-shadow rounded-xl h-full">
                <Table
                    columns={columns}
                    dataSource={recentDocuments}
                    pagination={false}
                    rowKey="key"
                    scroll={{ x: 'max-content' }}
                />
            </Card>
        </Col>
      </Row>
    </Space>
  );
}
