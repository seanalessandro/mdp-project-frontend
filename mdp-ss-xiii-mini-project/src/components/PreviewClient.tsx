"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout, Button, Space, Typography, Tag, Card, Popconfirm, message, Row, Col, Timeline, Spin } from 'antd'; // Import Timeline & Spin
import { EditOutlined, MailOutlined, HistoryOutlined, BranchesOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useEditor, EditorContent } from '@tiptap/react';
import useSWR, { useSWRConfig } from 'swr';
import * as api from '@/lib/api';
import StarterKit from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { Highlight } from '@tiptap/extension-highlight';
import CommentSection from '@/components/CommentSection'; // Asumsi komponen ini ada
import { ActivityLog } from '@/lib/types'; // Import tipe ActivityLog

import '@/app/dashboard/documents/[id]/editor-scoped.css';

const { Content } = Layout;

export default function PreviewClient({ documentData, docId }: { documentData: any, docId: string }) {
    const router = useRouter();
    const { mutate } = useSWRConfig();
    const [status, setStatus] = useState("Draft");

    // --- 1. TAMBAHKAN SWR HOOK UNTUK MENGAMBIL RIWAYAT ---
    const { data: history, isLoading: isLoadingHistory } = useSWR(
        docId ? `/documents/${docId}/history` : null, // Kunci harus unik per dokumen
        () => api.getDocumentHistory(docId)
    );

    // ----------------------------------------------------

    useEffect(() => {
        if (documentData) {
            setStatus(documentData.status || "Draft");
        }
    }, [documentData]);

    const editor = useEditor({
        editable: false,
        content: '',
        immediatelyRender: false,
        extensions: [
            StarterKit, Image, Table.configure({ resizable: true }),
            TableRow, TableHeader, TableCell, Highlight,
        ],
        editorProps: {
            attributes: { class: 'prose dark:prose-invert prose-sm sm:prose-base focus:outline-none' },
        },
    });

    useEffect(() => {
        if (documentData && editor && documentData.content) {
            try {
                editor.commands.setContent(JSON.parse(documentData.content));
            } catch (e) {
                console.error("Invalid content format:", e);
            }
        }
    }, [documentData, editor]);

    const handleSetStatus = async (newStatus: string) => {
        try {
            // await api.updateDocumentStatus(docId, newStatus);
            setStatus(newStatus);
            message.success(`Dokumen ditandai sebagai "${newStatus}"`);
            mutate(`/documents/${docId}`);
            mutate('/documents');
        } catch (err) {
            message.error("Gagal memperbarui status dokumen.");
        }
    };

    if (!documentData) {
        return null;
    }

    return (
        <Content style={{ margin: -24, padding: 24, background: '#fff', borderRadius: 8 }}>
            <div style={{ marginBottom: '24px' }}>
                <a onClick={() => router.push('/dashboard/documents')} style={{ color: '#888', cursor: 'pointer' }}>
                    ← Kembali ke Dashboard
                </a>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', borderBottom: '1px solid #f0f0f0', paddingBottom: '24px' }}>
                <div>
                    <Typography.Text style={{ color: '#6B7280' }}>{documentData.docNo}</Typography.Text>
                    <Typography.Title level={2} style={{ marginTop: 0, marginBottom: 0 }}>
                        {documentData.title}
                    </Typography.Title>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                    <Space>
                        <Tag color={status === 'In Review' ? 'blue' : 'default'} style={{ borderRadius: '16px', padding: '4px 24px' }}>
                            {status}
                        </Tag>
                        <Button icon={<BranchesOutlined />} shape="round" onClick={() => router.push(`/dashboard/documents/${docId}/history`)}
                            style={{ display: 'flex', alignItems: 'center', color: '#555' }}>
                            v{documentData.version?.toFixed(1)}
                        </Button>
                    </Space>
                    {status === 'Draft' && (
                        <Popconfirm
                            title="Ajukan untuk Review"
                            description="Apakah Anda yakin ingin mengajukan dokumen ini?"
                            onConfirm={() => handleSetStatus('In Review')}
                            okText="Ya, Ajukan"
                            cancelText="Batal"
                        >
                            <Button type="primary" style={{ padding: '24px 48px' }} icon={<CheckCircleOutlined />} size="large">
                                Ajukan Review
                            </Button>
                        </Popconfirm>
                    )}
                </div>
            </div>

            <Row gutter={32}>
                <Col span={16}>
                    <div className="tiptap-editor-container">
                        <EditorContent editor={editor} />
                    </div>
                </Col>
                <Col span={8}>
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Button
                            type="primary" icon={<EditOutlined />} block size="large"
                            style={{ padding: 24, marginBottom: 12, background: '#EBB305', borderColor: '#EBB305' }}
                            onClick={() => router.push(`/dashboard/documents/${docId}`)}
                        >
                            Edit Dokumen
                        </Button>
                        <Button
                            icon={<MailOutlined />} block size="large"
                            style={{ padding: 24, background: '#15B8A6', color: 'white', borderColor: '#15B8A6' }}
                        >
                            Kirim Pengingat Email
                        </Button>

                        {/* --- 2. ISI KARTU RIWAYAT DENGAN DATA --- */}
                        <Card size="large" title={<><HistoryOutlined /> Riwayat Perubahan</>} style={{ marginTop: '16px' }}>
                            {isLoadingHistory ? <Spin /> : (
                                <Timeline style={{ marginTop: '16px', paddingLeft: '8px' }}>
                                    {(history || []).map((log: ActivityLog) => (
                                        <Timeline.Item key={log.id}>
                                            <p style={{ marginBottom: '2px' }}><strong>{log.username}</strong> {log.action}</p>
                                            <Typography.Text type="secondary" style={{ fontSize: '12px' }}>
                                                {new Date(log.timestamp).toLocaleString('id-ID')}
                                            </Typography.Text>
                                        </Timeline.Item>
                                    ))}
                                </Timeline>
                            )}
                        </Card>
                    </Space>
                </Col>
            </Row>

            <div style={{ marginTop: '32px' }}>
                <CommentSection docId={docId} />
            </div>
        </Content>
    );
}