"use client";

import React, { useEffect, useState } from "react";
import { Button, Card, Col, Row, Statistic, Typography, Space, Table, Tag, Progress, Spin, message } from "antd";
import {
  FileTextOutlined,
  EditOutlined,
  ClockCircleOutlined,
  PlusOutlined,
  CheckCircleOutlined,
  EyeOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getDashboardStats, createDocument } from "@/lib/api";
import { DashboardStats } from "@/lib/types";
import CreateDocumentModal from "@/components/documents/CreateDocumentModal";

const { Title, Text } = Typography;

export default function EditorDashboard() {
  const { user, role } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setError('Failed to load dashboard data');
      message.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTemplateSelect = async (templateId: string) => {
    setIsProcessing(true);
    setIsTemplateModalVisible(false);
    try {
      const newDoc = await createDocument(templateId);
      message.success("Document created successfully!");
      fetchDashboardData(); // Refresh dashboard data
      router.push(`/dashboard/documents/${newDoc.id}`);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create document';
      message.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!stats || error) {
    return (
      <div className="text-center">
        <Text type="secondary">{error || 'Failed to load dashboard data'}</Text>
        <div className="mt-4">
          <Button onClick={fetchDashboardData} loading={loading}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Dynamic stats based on real data
  const editorStats = [
    { 
      title: 'Total Documents', 
      value: stats.totalDocuments, 
      prefix: <FileTextOutlined />, 
      suffix: 'docs' 
    },
    { 
      title: 'Draft', 
      value: stats.statusCounts.draft, 
      prefix: <EditOutlined />, 
      suffix: 'drafts' 
    },
    { 
      title: 'In Review Process', 
      value: stats.statusCounts.readyForReview + stats.statusCounts.waitingBR + stats.statusCounts.waitingDH, 
      prefix: <ClockCircleOutlined />, 
      suffix: 'pending' 
    },
    { 
      title: 'Approved', 
      value: stats.statusCounts.finalApproved, 
      prefix: <CheckCircleOutlined />, 
      suffix: 'final' 
    },
  ];

  // Helper function to format relative time
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    
    return date.toLocaleDateString();
  };

  // Convert recent documents to table format
  const myDocuments = stats.recentDocuments.map((doc) => ({
    key: doc.id,
    title: doc.title,
    status: doc.status.toLowerCase(),
    lastModified: getRelativeTime(doc.modifiedOn),
    docId: doc.id,
  }));

  const getStatusTag = (status: string) => {
    const statusConfig = {
      'draft': { color: 'blue', text: 'Draft' },
      'ready for review': { color: 'orange', text: 'Ready for Review' },
      'menunggu persetujuan br': { color: 'orange', text: 'Waiting BR Approval' },
      'menunggu persetujuan dh': { color: 'orange', text: 'Waiting DH Approval' },
      'final approved': { color: 'green', text: 'Final Approved' },
      'rejected': { color: 'red', text: 'Rejected' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status };
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
      title: 'Last Modified',
      dataIndex: 'lastModified',
      key: 'lastModified',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: { status: string; docId: string }) => (
        <Space>
          <Button 
            size="small" 
            icon={<EditOutlined />}
            type={record.status === 'draft' ? 'primary' : 'default'}
            onClick={() => router.push(`/dashboard/documents/${record.docId}`)}
          >
            Edit
          </Button>
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => router.push(`/dashboard/documents/preview/${record.docId}`)}
          >
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
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchDashboardData} 
                loading={loading}
                type="text"
                title="Refresh Dashboard"
              >
                Refresh
              </Button>
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
                onClick={() => setIsTemplateModalVisible(true)}
                loading={isProcessing}
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
                onClick={() => router.push('/dashboard/documents?status=draft')}
              >
                View Drafts
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
              locale={{
                emptyText: "No recent documents found. Create your first document to get started!"
              }}
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
                      percent={stats.totalDocuments > 0 ? Math.round((stats.statusCounts.draft / stats.totalDocuments) * 100) : 0} 
                      size={80}
                      strokeColor="#1890ff"
                    />
                  </div>
                  <Text type="secondary" className="block mt-2">
                    {stats.statusCounts.draft} documents in progress
                  </Text>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card size="small" className="text-center">
                  <div className="text-2xl mb-2">👁️</div>
                  <Text strong>Review Process</Text>
                  <div className="mt-2">
                    <Progress 
                      type="circle" 
                      percent={stats.totalDocuments > 0 ? Math.round(((stats.statusCounts.readyForReview + stats.statusCounts.waitingBR + stats.statusCounts.waitingDH) / stats.totalDocuments) * 100) : 0} 
                      size={80}
                      strokeColor="#faad14"
                    />
                  </div>
                  <Text type="secondary" className="block mt-2">
                    {stats.statusCounts.readyForReview + stats.statusCounts.waitingBR + stats.statusCounts.waitingDH} documents in review process
                  </Text>
                </Card>
              </Col>
              <Col xs={24} sm={8}>
                <Card size="small" className="text-center">
                  <div className="text-2xl mb-2">✅</div>
                  <Text strong>Final Approved</Text>
                  <div className="mt-2">
                    <Progress 
                      type="circle" 
                      percent={stats.totalDocuments > 0 ? Math.round((stats.statusCounts.finalApproved / stats.totalDocuments) * 100) : 0} 
                      size={80}
                      strokeColor="#52c41a"
                    />
                  </div>
                  <Text type="secondary" className="block mt-2">
                    {stats.statusCounts.finalApproved} documents approved
                  </Text>
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <CreateDocumentModal
        open={isTemplateModalVisible}
        onCancel={() => setIsTemplateModalVisible(false)}
        onSelect={handleTemplateSelect}
      />
    </div>
  );
}
