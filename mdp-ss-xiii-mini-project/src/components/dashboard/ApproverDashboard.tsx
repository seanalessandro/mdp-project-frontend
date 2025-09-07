"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Card, Table, Button, Space, Typography, Tag, message, Modal, Input } from "antd";
import { EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { getPendingDocumentsForApproval, approveDocument, rejectDocument } from "@/lib/api";
import { Document, PendingDocumentsResponse } from "@/lib/types";

const { Title, Text } = Typography;
const { TextArea } = Input;

interface ApproverDashboardProps {
  role: string;
}

export default function ApproverDashboard({ role }: ApproverDashboardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pendingDocs, setPendingDocs] = useState<PendingDocumentsResponse | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const [rejectComments, setRejectComments] = useState('');

  const fetchPendingDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPendingDocumentsForApproval(role);
      setPendingDocs(data);
    } catch (error) {
      console.error('Error fetching pending documents:', error);
      message.error('Failed to load pending documents');
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchPendingDocuments();
  }, [fetchPendingDocuments]);

  const handleApprove = async (docId: string) => {
    try {
      setActionLoading(docId);
      await approveDocument(docId, '');
      message.success('Document approved successfully!');
      await fetchPendingDocuments(); // Refresh the list
    } catch (error) {
      console.error('Error approving document:', error);
      message.error('Failed to approve document');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectClick = (docId: string) => {
    setSelectedDocId(docId);
    setRejectModalVisible(true);
  };

  const handleRejectSubmit = async () => {
    if (!selectedDocId || !rejectComments.trim()) {
      message.error('Comments are required for rejection');
      return;
    }

    try {
      setActionLoading(selectedDocId);
      await rejectDocument(selectedDocId, rejectComments);
      message.success('Document rejected');
      setRejectModalVisible(false);
      setSelectedDocId(null);
      setRejectComments('');
      await fetchPendingDocuments(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting document:', error);
      message.error('Failed to reject document');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig = {
      'Ready for Review': { color: 'orange', text: 'Ready for SH Review' },
      'Menunggu persetujuan BR': { color: 'orange', text: 'Waiting BR Approval' },
      'Menunggu persetujuan DH': { color: 'orange', text: 'Waiting DH Approval' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns = [
    {
      title: 'Document ID',
      dataIndex: 'docNo',
      key: 'docNo',
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => <Text strong>{title}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: string) => {
        const color = priority === 'High' ? 'red' : priority === 'Medium' ? 'orange' : 'green';
        return <Tag color={color}>{priority}</Tag>;
      },
    },
    {
      title: 'Submitted',
      dataIndex: 'modifiedOn',
      key: 'modifiedOn',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: unknown, record: Document) => (
        <Space>
          <Button
            size="small"
            icon={<EyeOutlined />}
            onClick={() => router.push(`/dashboard/documents/preview/${record.id}`)}
          >
            View
          </Button>
          <Button
            size="small"
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => handleApprove(record.id)}
            loading={actionLoading === record.id}
          >
            Approve
          </Button>
          <Button
            size="small"
            danger
            icon={<CloseCircleOutlined />}
            onClick={() => handleRejectClick(record.id)}
            loading={actionLoading === record.id}
          >
            Reject
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="max-w-full mx-auto">
      <Card className="mb-6">
        <Title level={2}>
          {role} Approval Dashboard - Welcome, {user?.username}!
        </Title>
        <Text type="secondary">
          Review and approve documents assigned to your role
        </Text>
      </Card>

      <Card
        title={`Pending Documents for ${role} Approval`}
        extra={
          <Button onClick={fetchPendingDocuments} loading={loading}>
            Refresh
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={pendingDocs?.pendingDocuments || []}
          loading={loading}
          rowKey="id"
          locale={{
            emptyText: "No documents pending your approval"
          }}
          pagination={false}
        />
      </Card>

      <Modal
        title="Reject Document"
        open={rejectModalVisible}
        onCancel={() => {
          setRejectModalVisible(false);
          setSelectedDocId(null);
          setRejectComments('');
        }}
        onOk={handleRejectSubmit}
        confirmLoading={actionLoading !== null}
        okButtonProps={{ danger: true }}
      >
        <div style={{ marginBottom: 16 }}>
          <Text>Please provide a reason for rejecting this document:</Text>
        </div>
        <TextArea
          rows={4}
          placeholder="Enter rejection comments..."
          value={rejectComments}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setRejectComments(e.target.value)}
        />
      </Modal>
    </div>
  );
}
