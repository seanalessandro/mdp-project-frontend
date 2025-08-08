"use client";

import React, { useState } from "react";
import { Button, Card, Col, Row, Statistic, Table, Tag, Typography, Space } from "antd"; // Import komponen Ant Design
import { FileTextOutlined, UserOutlined, ClockCircleOutlined, PlusOutlined, UsergroupAddOutlined, BarChartOutlined, SettingOutlined } from '@ant-design/icons'; // Import ikon Ant Design
import PaperIcon from "../../components/PaperIcon";

export default function DashboardPage() {
  const [user] = useState({ name: "Master User", role: "Administrator" });

  const handleLogout = () => {
    window.location.href = "/login";
  };

  // Data untuk tabel Recent Documents
  const recentDocuments = [
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
  ];

  // Kolom untuk tabel Recent Documents
  const columns = [
    {
      title: 'Document Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: any, b: any) => a.name.localeCompare(b.name),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'green';
        if (status === 'In Progress') {
          color = 'gold';
        } else if (status === 'Pending Review') {
          color = 'red';
        }
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      },
      sorter: (a: any, b: any) => a.status.localeCompare(b.status),
    },
    {
      title: 'Last Modified',
      dataIndex: 'lastModified',
      key: 'lastModified',
      sorter: (a: any, b: any) => a.lastModified.localeCompare(b.lastModified),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button type="link">
          {record.status === 'Completed' ? 'View' : record.status === 'In Progress' ? 'Edit' : 'Review'}
        </Button>
      ),
    },
  ];

  return (
    <>
      {/* Header Halaman Dashboard */}
      <Card className="-mx-6 -mt-6 rounded-t-xl rounded-b-none shadow-sm border-b">
        <Row align="middle" justify="space-between">
          <Col>
            <Space>
              <PaperIcon className="w-8 h-8 text-blue-500" />
              <div>
                <Typography.Title level={3} className="!text-xl !font-bold !text-gray-900 !mb-0">
                  Project MDP SS XII
                </Typography.Title>
                <Typography.Text type="secondary" className="!text-sm">
                  Business Requirement Document
                </Typography.Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Space size="middle">
              <div className="text-right">
                <Typography.Text strong className="!text-sm !block">
                  {user.name}
                </Typography.Text>
                <Typography.Text type="secondary" className="!text-xs">
                  {user.role}
                </Typography.Text>
              </div>
              <Button
                type="primary"
                danger // Untuk warna merah
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <main className="py-8">
        {/* Welcome Card */}
        <Card className="mb-8 rounded-xl shadow-lg">
          <Row align="middle" gutter={16}>
            <Col>
              <div className="bg-blue-100 p-3 rounded-full">
                <PaperIcon className="w-8 h-8 text-blue-600" />
              </div>
            </Col>
            <Col>
              <Typography.Title level={2} className="!text-2xl !font-bold !text-gray-800 !mb-0">
                Welcome back, {user.name}!
              </Typography.Title>
              <Typography.Paragraph type="secondary" className="!text-gray-600">
                Manage your Business Requirement Documents
              </Typography.Paragraph>
            </Col>
          </Row>
        </Card>

        {/* Stats Cards */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} md={8}>
            <Card className="rounded-xl shadow-lg">
              <Statistic
                title="Total Documents"
                value={24}
                valueStyle={{ color: '#1890ff', fontWeight: 'bold' }}
                prefix={<FileTextOutlined style={{ color: '#1890ff' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="rounded-xl shadow-lg">
              <Statistic
                title="Active Users"
                value={12}
                valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
                prefix={<UserOutlined style={{ color: '#52c41a' }} />}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="rounded-xl shadow-lg">
              <Statistic
                title="Pending Reviews"
                value={7}
                valueStyle={{ color: '#faad14', fontWeight: 'bold' }}
                prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              />
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Card title={<Typography.Title level={4} className="!text-lg !font-semibold !text-gray-800 !mb-0">Quick Actions</Typography.Title>} className="mb-8 rounded-xl shadow-lg">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Button type="primary" size="large" block icon={<PlusOutlined />} className="!h-auto !py-4">
                <span className="block text-sm font-medium">New Document</span>
              </Button>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Button type="primary" size="large" block icon={<UsergroupAddOutlined />} className="!h-auto !py-4"
                onClick={() => window.location.href = "/manage-users"}
              >
                <span className="block text-sm font-medium">Manage Users</span>
              </Button>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Button type="primary" size="large" block icon={<BarChartOutlined />} className="!h-auto !py-4">
                <span className="block text-sm font-medium">View Reports</span>
              </Button>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Button type="default" size="large" block icon={<SettingOutlined />} className="!h-auto !py-4">
                <span className="block text-sm font-medium">Settings</span>
              </Button>
            </Col>
          </Row>
        </Card>

        {/* Recent Documents */}
        <Card title={<Typography.Title level={4} className="!text-lg !font-semibold !text-gray-800 !mb-0">Recent Documents</Typography.Title>} className="rounded-xl shadow-lg">
          <Table
            columns={columns}
            dataSource={recentDocuments}
            pagination={false} // Nonaktifkan paginasi jika data sedikit
            rowKey="key"
            scroll={{ x: 'max-content' }} // Untuk scroll horizontal pada layar kecil
            className="w-full" // Tailwind class untuk lebar penuh
          />
        </Card>
      </main>
    </>
  );
}
