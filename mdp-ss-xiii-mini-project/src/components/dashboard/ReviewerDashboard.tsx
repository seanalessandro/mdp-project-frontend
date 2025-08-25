"use client";

import React from "react";
import { Button, Card, Col, Row, Statistic, Typography, Space, Table, Tag, Badge, Timeline } from "antd";
import {
  FileTextOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  EditOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const { Title, Text } = Typography;

export default function ReviewerDashboard() {
  const { user, role } = useAuth();
  const router = useRouter();

  // Sample data for reviewer overview
  const reviewStats = [
    { title: 'Pending Reviews', value: 12, prefix: <ClockCircleOutlined />, suffix: 'docs' },
    { title: 'Completed Today', value: 5, prefix: <CheckCircleOutlined />, suffix: 'reviews' },
    { title: 'High Priority', value: 3, prefix: <ExclamationCircleOutlined />, suffix: 'urgent' },
    { title: 'My Rating', value: 4.8, prefix: <StarOutlined />, suffix: '/5.0' },
  ];

  const pendingReviews = [
    { 
      key: '1', 
      title: 'User Authentication API Guide', 
      author: 'John Doe',
      priority: 'high',
      daysWaiting: 2,
      category: 'Technical'
    },
    { 
      key: '2', 
      title: 'Product Feature Specification', 
      author: 'Jane Smith',
      priority: 'medium',
      daysWaiting: 1,
      category: 'Product'
    },
    { 
      key: '3', 
      title: 'Database Migration Guide', 
      author: 'Bob Wilson',
      priority: 'high',
      daysWaiting: 3,
      category: 'Technical'
    },
    { 
      key: '4', 
      title: 'UI/UX Design Standards', 
      author: 'Alice Brown',
      priority: 'low',
      daysWaiting: 1,
      category: 'Design'
    },
  ];

  const getPriorityTag = (priority: string) => {
    const priorityConfig = {
      high: { color: 'red', text: 'High Priority' },
      medium: { color: 'orange', text: 'Medium' },
      low: { color: 'blue', text: 'Low Priority' },
    };
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getCategoryTag = (category: string) => {
    const categoryConfig = {
      Technical: { color: 'purple' },
      Product: { color: 'green' },
      Design: { color: 'cyan' },
    };
    const config = categoryConfig[category as keyof typeof categoryConfig];
    return <Tag color={config.color}>{category}</Tag>;
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
      title: 'Author',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => getCategoryTag(category),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => getPriorityTag(priority),
    },
    {
      title: 'Waiting',
      dataIndex: 'daysWaiting',
      key: 'daysWaiting',
      render: (days: number) => (
        <Badge 
          count={days} 
          style={{ backgroundColor: days > 2 ? '#f5222d' : '#52c41a' }}
          title={`${days} days waiting`}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: { priority: string }) => (
        <Space>
          <Button 
            size="small" 
            type="primary"
            icon={<EyeOutlined />}
          >
            Review
          </Button>
          <Button 
            size="small" 
            icon={<EditOutlined />}
            type={record.priority === 'high' ? 'primary' : 'default'}
            ghost={record.priority !== 'high'}
          >
            Comment
          </Button>
        </Space>
      ),
    },
  ];

  const recentActivity = [
    {
      children: (
        <div>
          <Text strong>Approved &ldquo;API Documentation v3.0&rdquo;</Text>
          <br />
          <Text type="secondary">2 hours ago</Text>
        </div>
      ),
      color: 'green',
    },
    {
      children: (
        <div>
          <Text strong>Requested changes for &ldquo;User Guide&rdquo;</Text>
          <br />
          <Text type="secondary">4 hours ago</Text>
        </div>
      ),
      color: 'orange',
    },
    {
      children: (
        <div>
          <Text strong>Started review of &ldquo;Security Policy&rdquo;</Text>
          <br />
          <Text type="secondary">1 day ago</Text>
        </div>
      ),
      color: 'blue',
    },
  ];

  return (
    <div className="max-w-full mx-auto">
      {/* Welcome Header */}
      <Card className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <Row align="middle" justify="space-between">
          <Col>
            <Space direction="vertical" size="small">
              <Title level={2} className="!mb-0 !text-purple-800">
                Welcome back, {user?.username}!
              </Title>
              <Text className="text-purple-600">
                Reviewer Dashboard - Documents awaiting your review
              </Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Text type="secondary">Role: </Text>
              <Tag color="purple" icon={<StarOutlined />}>
                {role?.name || 'Reviewer'}
              </Tag>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Review Statistics */}
      <Row gutter={[16, 16]} className="mb-6">
        {reviewStats.map((stat, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                valueStyle={{ 
                  color: index === 0 ? '#fa8c16' : 
                         index === 1 ? '#52c41a' : 
                         index === 2 ? '#f5222d' : '#1890ff' 
                }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Content */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <ClockCircleOutlined />
                Documents Pending Review
                <Badge count={pendingReviews.length} style={{ backgroundColor: '#fa8c16' }} />
              </Space>
            }
          >
            <Table
              dataSource={pendingReviews}
              columns={columns}
              pagination={false}
              size="small"
            />
            <div className="text-center mt-4">
              <Button 
                type="link"
                onClick={() => router.push('/dashboard/documents')}
              >
                View All Pending Reviews
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Quick Actions" className="mb-4">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                icon={<ClockCircleOutlined />} 
                block
                onClick={() => router.push('/dashboard/documents?filter=pending')}
              >
                Review Pending Documents
              </Button>
              <Button 
                icon={<CheckCircleOutlined />} 
                block
                onClick={() => router.push('/dashboard/documents?filter=completed')}
              >
                View Completed Reviews
              </Button>
              <Button 
                icon={<ExclamationCircleOutlined />} 
                block
                type="dashed"
                onClick={() => router.push('/dashboard/documents?filter=urgent')}
              >
                High Priority Items
              </Button>
            </Space>
          </Card>

          <Card title="Recent Activity">
            <Timeline items={recentActivity} />
            <div className="text-center mt-4">
              <Button type="link">View All Activity</Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Review Performance */}
      <Row gutter={[16, 16]}>
        <Col xs={24}>
          <Card title="Review Performance This Week">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Card size="small" className="text-center">
                  <div className="text-2xl mb-2">⏱️</div>
                  <Text strong>Average Review Time</Text>
                  <div className="mt-2 text-2xl text-blue-600">
                    <Text strong>2.3 hrs</Text>
                  </div>
                  <Text type="secondary" className="block">
                    -15% from last week
                  </Text>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card size="small" className="text-center">
                  <div className="text-2xl mb-2">📊</div>
                  <Text strong>Reviews Completed</Text>
                  <div className="mt-2 text-2xl text-green-600">
                    <Text strong>23</Text>
                  </div>
                  <Text type="secondary" className="block">
                    +8% from last week
                  </Text>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card size="small" className="text-center">
                  <div className="text-2xl mb-2">⭐</div>
                  <Text strong>Quality Score</Text>
                  <div className="mt-2 text-2xl text-purple-600">
                    <Text strong>4.8/5</Text>
                  </div>
                  <Text type="secondary" className="block">
                    Excellent feedback
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
