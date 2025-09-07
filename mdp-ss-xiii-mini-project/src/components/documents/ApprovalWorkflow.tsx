"use client";

import React, { useState } from 'react';
import { Card, Steps, Button, Space, Modal, Input, message, Tag, Timeline } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CloseCircleOutlined,
  SendOutlined,
  ExclamationCircleOutlined 
} from '@ant-design/icons';
import { Document, ApprovalLevel } from '@/lib/types';
import { submitDocumentForReview, approveDocument, rejectDocument } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const { TextArea } = Input;
const { Step } = Steps;

interface ApprovalWorkflowProps {
  document: Document;
  onStatusChange: () => void;
}

export default function ApprovalWorkflow({ document, onStatusChange }: ApprovalWorkflowProps) {
  const { user, role } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [comments, setComments] = useState('');

  const isOwner = user?.id === document.ownerId;
  const userRole = role?.name;

  const getStepStatus = (approval: ApprovalLevel) => {
    if (approval.status === 'approved') return 'finish';
    if (approval.status === 'rejected') return 'error';
    return 'wait';
  };

  const getStepIcon = (approval: ApprovalLevel) => {
    if (approval.status === 'approved') return <CheckCircleOutlined />;
    if (approval.status === 'rejected') return <CloseCircleOutlined />;
    return <ClockCircleOutlined />;
  };

  const canApprove = () => {
    if (!document.approvals || document.approvals.length === 0) return false;
    
    const currentLevel = document.approvals[document.currentApprovalLevel - 1];
    if (!currentLevel || currentLevel.status !== 'pending') return false;

    // Check role permissions
    if (currentLevel.roleName === 'SH' && ['SH', 'DH', 'GDH'].includes(userRole || '')) return true;
    if (currentLevel.roleName === 'BR' && userRole === 'BR') return true;
    if (currentLevel.roleName === 'DH' && ['DH', 'GDH'].includes(userRole || '')) return true;

    return false;
  };

  const handleSubmitForReview = async () => {
    try {
      setLoading(true);
      await submitDocumentForReview(document.id);
      message.success('Document submitted for review successfully!');
      onStatusChange();
    } catch (error) {
      console.error('Error submitting document:', error);
      message.error('Failed to submit document for review');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    try {
      setLoading(true);
      await approveDocument(document.id, comments);
      message.success('Document approved successfully!');
      setShowApproveModal(false);
      setComments('');
      onStatusChange();
    } catch (error) {
      console.error('Error approving document:', error);
      message.error('Failed to approve document');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!comments.trim()) {
      message.error('Comments are required for rejection');
      return;
    }

    try {
      setLoading(true);
      await rejectDocument(document.id, comments);
      message.success('Document rejected');
      setShowRejectModal(false);
      setComments('');
      onStatusChange();
    } catch (error) {
      console.error('Error rejecting document:', error);
      message.error('Failed to reject document');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft': return 'blue';
      case 'ready for review': return 'orange';
      case 'menunggu persetujuan br': return 'orange';
      case 'menunggu persetujuan dh': return 'orange';
      case 'final approved': return 'green';
      case 'rejected': return 'red';
      default: return 'default';
    }
  };

  return (
    <Card title="Approval Workflow" className="mt-4">
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        {/* Current Status */}
        <div>
          <Space>
            <span>Current Status:</span>
            <Tag color={getStatusColor(document.status)}>{document.status}</Tag>
          </Space>
        </div>

        {/* Submit for Review Button (only for document owner and draft status) */}
        {isOwner && document.status === 'Draft' && (
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleSubmitForReview}
            loading={loading}
          >
            Submit for Review
          </Button>
        )}

        {/* Approval Actions (only for approvers at current level) */}
        {canApprove() && (
          <Space>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => setShowApproveModal(true)}
              loading={loading}
            >
              Approve
            </Button>
            <Button
              danger
              icon={<CloseCircleOutlined />}
              onClick={() => setShowRejectModal(true)}
              loading={loading}
            >
              Reject
            </Button>
          </Space>
        )}

        {/* Approval Steps */}
        {document.approvals && document.approvals.length > 0 && (
          <div>
            <h4>Approval Progress</h4>
            <Steps current={document.currentApprovalLevel - 1} size="small">
              {document.approvals.map((approval, index) => (
                <Step
                  key={index}
                  title={approval.roleName}
                  status={getStepStatus(approval)}
                  icon={getStepIcon(approval)}
                  description={
                    approval.status === 'approved' 
                      ? `Approved ${approval.approvedAt ? new Date(approval.approvedAt).toLocaleDateString() : ''}` 
                      : approval.status === 'rejected' 
                      ? `Rejected ${approval.rejectedAt ? new Date(approval.rejectedAt).toLocaleDateString() : ''}`
                      : 'Pending'
                  }
                />
              ))}
            </Steps>
          </div>
        )}

        {/* Approval History */}
        {document.approvals && document.approvals.some(a => a.status !== 'pending') && (
          <div>
            <h4>Approval History</h4>
            <Timeline>
              {document.approvals
                .filter(approval => approval.status !== 'pending')
                .map((approval, index) => (
                <Timeline.Item
                  key={index}
                  dot={approval.status === 'approved' ? <CheckCircleOutlined style={{ color: 'green' }} /> : <CloseCircleOutlined style={{ color: 'red' }} />}
                  color={approval.status === 'approved' ? 'green' : 'red'}
                >
                  <div>
                    <strong>{approval.roleName}</strong> {approval.status} the document
                    <br />
                    <small>{approval.approvedAt ? new Date(approval.approvedAt).toLocaleString() : approval.rejectedAt ? new Date(approval.rejectedAt).toLocaleString() : ''}</small>
                    {approval.comments && (
                      <div style={{ marginTop: 4, fontStyle: 'italic' }}>
                        Comments: {approval.comments}
                      </div>
                    )}
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
          </div>
        )}
      </Space>

      {/* Approve Modal */}
      <Modal
        title="Approve Document"
        open={showApproveModal}
        onCancel={() => {
          setShowApproveModal(false);
          setComments('');
        }}
        onOk={handleApprove}
        confirmLoading={loading}
      >
        <p>Are you sure you want to approve this document?</p>
        <TextArea
          rows={4}
          placeholder="Add comments (optional)"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
        />
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Reject Document"
        open={showRejectModal}
        onCancel={() => {
          setShowRejectModal(false);
          setComments('');
        }}
        onOk={handleReject}
        confirmLoading={loading}
        okButtonProps={{ danger: true }}
      >
        <div style={{ marginBottom: 16 }}>
          <ExclamationCircleOutlined style={{ color: 'red', marginRight: 8 }} />
          Are you sure you want to reject this document?
        </div>
        <TextArea
          rows={4}
          placeholder="Comments are required for rejection"
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          required
        />
      </Modal>
    </Card>
  );
}
