"use client";

import React from "react";
import { Button, Card, Col, Row, Statistic, Typography, Space, Table, Tag } from "antd";
import {
  FileTextOutlined,
  UserOutlined,
  ClockCircleOutlined,
  UsergroupAddOutlined,
  BarChartOutlined,
  SettingOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const { Title, Text } = Typography;

export default function AdminDashboard() {
  const { user, role } = useAuth();
  const router = useRouter();

  // Sample data for admin overview
  const systemStats = [
    { title: 'Total Users', value: 127, prefix: <UserOutlined />, suffix: 'users' },
    { title: 'Active Documents', value: 89, prefix: <FileTextOutlined />, suffix: 'docs' },
    { title: 'Pending Reviews', value: 23, prefix: <ClockCircleOutlined />, suffix: 'pending' },
    { title: 'System Health', value: 98.5, prefix: <BarChartOutlined />, suffix: '%' },
  ];

  const recentActivities = [
    { 
      key: '1', 
      user: 'John Doe', 
      action: 'Created new document', 
      time: '2 minutes ago',
      status: 'success'
    },
    { 
      key: '2', 
      user: 'Jane Smith', 
      action: 'Updated user role', 
      time: '5 minutes ago',
      status: 'info'
    },
    { 
      key: '3', 
      user: 'Bob Wilson', 
      action: 'Reviewed document', 
      time: '10 minutes ago',
      status: 'success'
    },
  ];

  const columns = [
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'success' ? 'green' : 'blue'}>
          {status === 'success' ? 'Completed' : 'In Progress'}
        </Tag>
      ),
    },
  ];

  return (
    <div className="max-w-full mx-auto">
      {/* Welcome Header */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <Row align="middle" justify="space-between">
          <Col>
            <Space direction="vertical" size="small">
              <Title level={2} className="!mb-0 !text-blue-800">
                Welcome back, {user?.username}!
              </Title>
              <Text className="text-blue-600">
                Admin Dashboard - You have full system access
              </Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Text type="secondary">Role: </Text>
              <Tag color="red" icon={<SettingOutlined />}>
                {role?.name || 'Admin'}
              </Tag>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* System Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        {systemStats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                valueStyle={{ color: index % 2 === 0 ? '#3f8600' : '#1890ff' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={12}>
          <Card title="Quick Actions" extra={<SettingOutlined />}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                icon={<UsergroupAddOutlined />} 
                block
                onClick={() => router.push('/dashboard/manage-users')}
              >
                Manage Users
              </Button>
              <Button 
                icon={<UserOutlined />} 
                block
                onClick={() => router.push('/dashboard/manage-roles')}
              >
                Manage Roles
              </Button>
              <Button 
                icon={<FileTextOutlined />} 
                block
                onClick={() => router.push('/dashboard/documents')}
              >
                View All Documents
              </Button>
              <Button 
                icon={<BarChartOutlined />} 
                block
                type="dashed"
              >
                System Reports
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="Recent System Activities" extra={<ClockCircleOutlined />}>
            <Table
              dataSource={recentActivities}
              columns={columns}
              pagination={false}
              size="small"
            />
            <div className="text-center mt-4">
              <Button type="link">View All Activities</Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* System Health Status */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="System Status" extra={<CheckCircleOutlined style={{ color: '#52c41a' }} />}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Card size="small">
                  <Statistic
                    title="Database"
                    value="Operational"
                    prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card size="small">
                  <Statistic
                    title="Email Service"
                    value="Operational"
                    prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card size="small">
                  <Statistic
                    title="API Gateway"
                    value="Operational"
                    prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
