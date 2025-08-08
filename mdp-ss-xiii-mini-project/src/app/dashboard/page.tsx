"use client";

import React, { useState, useEffect } from 'react';
import { Button, Card, Col, Row, Statistic, Table, Tag, Typography, Space, Layout, Avatar } from 'antd';
import {
  ReadOutlined,
  FileTextOutlined,
  UserOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  UsergroupAddOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import type { ButtonType } from 'antd/es/button';


// --- Ant Design Components ---
const { Header, Content } = Layout;
const { Title, Text } = Typography;

// --- TypeScript Interfaces ---
// Menambahkan tipe data untuk memastikan konsistensi data pada tabel
interface Document {
  key: string;
  name: string;
  status: 'Completed' | 'In Progress' | 'Pending Review';
  lastModified: string;
}

// Menambahkan tipe data untuk props StatCard
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

// Menambahkan tipe data untuk props ActionButton
interface ActionButtonProps {
    icon: React.ReactNode;
    text: string;
    onClick?: () => void;
    type?: ButtonType;
}


// --- Main Dashboard Component ---
export default function App() {
  // --- State Management ---
  const [user] = useState({ name: "Master User", role: "Administrator" });
  const [isClient, setIsClient] = useState(false);

  // --- Effect Hook for Client-Side Rendering ---
  // Mengatasi hydration error dengan memastikan render hanya terjadi di client
  useEffect(() => {
    setIsClient(true);
  }, []);

  // --- Event Handlers ---
  const handleLogout = () => {
    // Arahkan ke halaman login
    console.log("Logout clicked");
    // window.location.href = "/login"; // Uncomment this in a real app
  };

  // --- Data for Recent Documents Table ---
  const recentDocuments: Document[] = [
    {
      key: '1',
      name: 'User Management System BRD',
      status: 'Completed',
      lastModified: '2 hours ago',
    },
    {
      key: '2',
      name: 'Payment Gateway Integration',
      status: 'In Progress',
      lastModified: '1 day ago',
    },
    {
      key: '3',
      name: 'Mobile App Requirements',
      status: 'Pending Review',
      lastModified: '3 days ago',
    },
     {
      key: '4',
      name: 'API Documentation V2',
      status: 'Completed',
      lastModified: '5 days ago',
    },
  ];

  // --- Table Column Definitions ---
  const columns = [
    {
      title: 'Document Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Document, b: Document) => a.name.localeCompare(b.name),
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: (a: Document, b: Document) => a.status.localeCompare(b.status),
      render: (status: Document['status']) => {
        let color: string = 'success';
        if (status === 'In Progress') {
          color = 'processing';
        } else if (status === 'Pending Review') {
          color = 'error';
        }
        return <Tag color={color} className="font-semibold">{status.toUpperCase()}</Tag>;
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

  // --- Stat Card Component ---
  // Membuat komponen kecil untuk kartu statistik agar kode lebih rapi
  const StatCard = ({ title, value, icon, color }: StatCardProps) => (
    <Card bordered={false} className="shadow-sm hover:shadow-lg transition-shadow rounded-xl h-full">
      <Statistic
        title={<Text type="secondary">{title}</Text>}
        value={value}
        valueStyle={{ color: color, fontWeight: 'bold' }}
        prefix={<div className="text-2xl mr-3">{icon}</div>}
      />
    </Card>
  );
  
  // --- Quick Action Button Component ---
  const ActionButton = ({ icon, text, onClick = () => {}, type = "default" }: ActionButtonProps) => (
     <Button 
        type={type} 
        size="large" 
        icon={icon} 
        onClick={onClick}
        className="w-full h-full flex flex-col justify-center items-center py-4 !bg-white"
        style={{ height: '100px' }}
     >
        <Text className="font-semibold">{text}</Text>
     </Button>
  );

  // --- Render Null on Server/Initial Hydration ---
  if (!isClient) {
    return null;
  }

  // --- Render JSX on Client ---
  return (
    <Layout className="min-h-screen bg-gray-50 font-sans">
      {/* --- Page Header --- */}
      <Header className="bg-white shadow-sm sticky top-0 z-10 !px-6 flex items-center justify-between">
        <Space align="center" size="middle">
          <ReadOutlined className="text-3xl text-blue-600" />
          <div>
            <Title level={4} className="!mb-0">Project MDP SS XII</Title>
            <Text type="secondary" className="hidden sm:block">Business Requirement Document</Text>
          </div>
        </Space>
        <Space align="center" size="middle">
          <div className="text-right">
            <Text strong className="block">{user.name}</Text>
            <Text type="secondary">{user.role}</Text>
          </div>
          <Avatar icon={<UserOutlined />} size="large" className="bg-blue-100 text-blue-600" />
          <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout} danger>
             Logout
          </Button>
        </Space>
      </Header>

      {/* --- Main Content --- */}
      <Content className="p-4 sm:p-6 md:p-8">
        <Space direction="vertical" size="large" className="w-full">
          
          {/* --- Welcome Card --- */}
          <Card bordered={false} className="rounded-xl shadow-sm bg-blue-50 border-blue-200">
            <Row align="middle" gutter={[16, 16]}>
              <Col>
                <Avatar size={64} icon={<FileTextOutlined />} className="bg-blue-100 text-blue-600" />
              </Col>
              <Col>
                <Title level={2} className="!mb-0">Welcome back, {user.name}!</Title>
                <Text type="secondary" className="text-base">Here's your dashboard overview for today.</Text>
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
          <Row gutter={[24, 24]}>
            {/* --- Quick Actions --- */}
            <Col xs={24} lg={8}>
                <Card title={<Title level={5} className="!font-bold">Quick Actions</Title>} bordered={false} className="shadow-sm hover:shadow-lg transition-shadow rounded-xl h-full">
                     <Row gutter={[16, 16]}>
                        <Col span={12}><ActionButton icon={<PlusOutlined />} text="New Document" /></Col>
                        <Col span={12}><ActionButton icon={<UsergroupAddOutlined />} text="Manage Users" /></Col>
                        <Col span={12}><ActionButton icon={<BarChartOutlined />} text="View Reports" /></Col>
                        <Col span={12}><ActionButton icon={<SettingOutlined />} text="Settings" /></Col>
                     </Row>
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
      </Content>
    </Layout>
  );
}
