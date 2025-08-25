"use client";

import React from "react";
import { Button, Card, Col, Row, Statistic, Typography, Space, Table, Tag, Progress } from "antd";
import {
  FileTextOutlined,
  EditOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const { Title, Text } = Typography;

export default function EditorDashboard() {
  const { user, role } = useAuth();
  const router = useRouter();

  // Sample data for editor overview
  const editorStats = [
    { title: 'My Documents', value: 15, prefix: <FileTextOutlined />, suffix: 'docs' },
    { title: 'In Progress', value: 8, prefix: <EditOutlined />, suffix: 'drafts' },
    { title: 'Under Review', value: 4, prefix: <ClockCircleOutlined />, suffix: 'pending' },
    { title: 'Published', value: 12, prefix: <CheckCircleOutlined />, suffix: 'live' },
  ];

  const myDocuments = [
    { 
      key: '1', 
      title: 'Project Requirements Document', 
      status: 'draft',
      lastModified: '2 hours ago',
      progress: 75
    },
    { 
      key: '2', 
      title: 'User Manual v2.0', 
      status: 'review',
      lastModified: '1 day ago',
      progress: 100
    },
    { 
      key: '3', 
      title: 'API Documentation', 
      status: 'published',
      lastModified: '3 days ago',
      progress: 100
    },
    { 
      key: '4', 
      title: 'Release Notes Q4', 
      status: 'draft',
      lastModified: '5 days ago',
      progress: 30
    },
  ];

  const getStatusTag = (status: string) => {
    const statusConfig = {
      draft: { color: 'blue', text: 'Draft' },
      review: { color: 'orange', text: 'Under Review' },
      published: { color: 'green', text: 'Published' },
    };
    const config = statusConfig[status as keyof typeof statusConfig];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: 'Document Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => (
        <Space>
          <FileTextOutlined />
          <Text strong>{title}</Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Progress',
      dataIndex: 'progress',
      key: 'progress',
      render: (progress: number) => (
        <Progress percent={progress} size="small" />
      ),
    },
    {
      title: 'Last Modified',
      dataIndex: 'lastModified',
      key: 'lastModified',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: { status: string }) => (
        <Space>
          <Button 
            size="small" 
            icon={<EditOutlined />}
            type={record.status === 'draft' ? 'primary' : 'default'}
          >
            Edit
          </Button>
          <Button size="small" icon={<EyeOutlined />}>
            View
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="max-w-full mx-auto">
      {/* Welcome Header */}
      <Card className="mb-6 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <Row align="middle" justify="space-between">
          <Col>
            <Space direction="vertical" size="small">
              <Title level={2} className="!mb-0 !text-green-800">
                Welcome back, {user?.username}!
              </Title>
              <Text className="text-green-600">
                Editor Dashboard - Focus on your active documents
              </Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Text type="secondary">Role: </Text>
              <Tag color="green" icon={<EditOutlined />}>
                {role?.name || 'Editor'}
              </Tag>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Document Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        {editorStats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                valueStyle={{ color: index % 2 === 0 ? '#52c41a' : '#1890ff' }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={8}>
          <Card title="Quick Actions" extra={<EditOutlined />}>
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                block
                onClick={() => router.push('/dashboard/documents/new')}
              >
                Create New Document
              </Button>
              <Button 
                icon={<FileTextOutlined />} 
                block
                onClick={() => router.push('/dashboard/documents')}
              >
                View All Documents
              </Button>
              <Button 
                icon={<ClockCircleOutlined />} 
                block
                type="dashed"
              >
                Drafts & Templates
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="My Active Documents" extra={<FileTextOutlined />}>
            <Table
              dataSource={myDocuments}
              columns={columns}
              pagination={false}
              size="small"
            />
            <div className="text-center mt-4">
              <Button 
                type="link"
                onClick={() => router.push('/dashboard/documents')}
              >
                View All My Documents
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Document Status Overview */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="Document Workflow Status">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Card size="small" className="text-center">
                  <div className="text-2xl mb-2">📝</div>
                  <Text strong>Draft Phase</Text>
                  <div className="mt-2">
                    <Progress 
                      type="circle" 
                      percent={60} 
                      size={80}
                      strokeColor="#1890ff"
                    />
                  </div>
                  <Text type="secondary" className="block mt-2">
                    8 documents in progress
                  </Text>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card size="small" className="text-center">
                  <div className="text-2xl mb-2">👁️</div>
                  <Text strong>Review Phase</Text>
                  <div className="mt-2">
                    <Progress 
                      type="circle" 
                      percent={80} 
                      size={80}
                      strokeColor="#faad14"
                    />
                  </div>
                  <Text type="secondary" className="block mt-2">
                    4 documents under review
                  </Text>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card size="small" className="text-center">
                  <div className="text-2xl mb-2">✅</div>
                  <Text strong>Published</Text>
                  <div className="mt-2">
                    <Progress 
                      type="circle" 
                      percent={100} 
                      size={80}
                      strokeColor="#52c41a"
                    />
                  </div>
                  <Text type="secondary" className="block mt-2">
                    12 documents live
                  </Text>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
