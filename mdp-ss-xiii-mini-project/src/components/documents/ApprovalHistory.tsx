"use client";

import React, { useState, useEffect } from 'react';
import { Timeline, Card, Typography, Tag, Space, Spin, Alert } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ClockCircleOutlined, UserOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import * as api from '@/lib/api';
import moment from 'moment';
import { ApprovalHistoryEntry } from '@/lib/types';

const { Text } = Typography;

const statusColors = {
    'approved': 'success',
    'rejected': 'error',
    'submitted': 'blue',
    'created': 'processing',
    'updated': 'default',
};

const statusIcons = {
    'approved': <CheckCircleOutlined style={{ color: '#52c41a' }} />,
    'rejected': <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
    'submitted': <ClockCircleOutlined style={{ color: '#1890ff' }} />,
    'created': <PlusOutlined style={{ color: '#1890ff' }} />,
    'updated': <EditOutlined style={{ color: '#faad14' }} />,
};

export default function ApprovalHistory({ docId }: { docId: string }) {
    const [history, setHistory] = useState<ApprovalHistoryEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!docId) {
            setIsLoading(false);
            return;
        }

        const fetchHistory = async () => {
            try {
                const data = await api.getDocumentApprovalHistory(docId);
                setHistory(data);
                setError(null);
            } catch (err: any) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchHistory();
    }, [docId]); // Dependensi useEffect

    const getStatusKey = (action: string) => {
        return action as keyof typeof statusIcons;
    };

    if (isLoading) {
        return <Spin tip="Memuat riwayat persetujuan..." />;
    }

    if (error) {
        return <Alert message="Gagal memuat riwayat persetujuan." description={error.message} type="error" showIcon />;
    }

    if (!history || history.length === 0) {
        return <Alert message="Belum ada riwayat persetujuan untuk dokumen ini." type="info" />;
    }

    const timelineItems = history.map((entry) => ({
        key: entry.id,
        label: (
            <Space direction="vertical" size={2}>
                <Text strong>{entry.username}</Text>
                <Text type="secondary">{moment(entry.timestamp).format('DD MMMM YYYY, HH:mm')}</Text>
            </Space>
        ),
        dot: statusIcons[getStatusKey(entry.action)] || <UserOutlined />,
        children: (
            <Card size="small">
                <Space direction="vertical" size={4}>
                    <Text>
                        <Tag color={statusColors[getStatusKey(entry.action)]}>
                            {entry.action.toUpperCase()}
                        </Tag>
                        pada level <Tag color="geekblue">{entry.roleName || 'N/A'}</Tag>
                        oleh <Tag icon={<UserOutlined />}>{entry.username}</Tag>
                    </Text>
                    {entry.comments && (
                        <Text type="secondary" italic>
                            Komentar: "{entry.comments}"
                        </Text>
                    )}
                    <Text>
                        Status berubah dari <Tag>{entry.prevStatus}</Tag> ke <Tag color={statusColors[getStatusKey(entry.newStatus)]}>{entry.newStatus}</Tag>
                    </Text>
                    <Text>
                        Pada <Tag>{moment(entry.timestamp).format('YYYY-MM-DD HH:mm:ss')}</Tag> 
                    </Text>
                </Space>
            </Card>
        ),
    }));

    return (
        <Card title="Riwayat Persetujuan" bordered={false}>
            <Timeline items={timelineItems} />
        </Card>
    );
}