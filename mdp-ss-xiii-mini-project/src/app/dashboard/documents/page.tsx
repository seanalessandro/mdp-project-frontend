"use client";

import React, { useState, useMemo } from 'react';
import { Button, Table, Space, Typography, Popconfirm, message, Modal, Input, Row, Form, Select, Tag, Tooltip, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import useSWR, { useSWRConfig } from 'swr';
import * as api from '@/lib/api';
import { Document, DocumentTemplate } from '@/lib/types';

const { Option } = Select;

export default function DocumentsPage() {
    const router = useRouter();
    const { data: documents, error, mutate: mutateDocumentList, isLoading } = useSWR('/documents', api.getMyDocuments);
    const { data: templates } = useSWR('/templates', api.getTemplates);
    const { mutate } = useSWRConfig();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [form] = Form.useForm();
    const [selectedContent, setSelectedContent] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const handleCreateDocument = async (values: any) => {
        setIsCreating(true);
        try {
            const payload = { ...values, content: selectedContent || undefined };
            const newDoc = await api.createDocument(payload);

            await mutate(`/documents/${newDoc.id}`, newDoc, { revalidate: false });

            mutateDocumentList();

            message.success("Dokumen baru berhasil dibuat!");
            setIsModalVisible(false);
            form.resetFields();
            setSelectedContent('');

            router.push(`/dashboard/documents/${newDoc.id}`);
        } catch (err: any) {
            message.error(err.message || "Gagal membuat dokumen");
        } finally {
            setIsCreating(false);
        }
    };

    const handleTemplateChange = (templateId: string) => {
        const selectedTemplate = templates?.find((t: DocumentTemplate) => t.id === templateId);
        setSelectedContent(selectedTemplate ? selectedTemplate.content : '');
    };

    const handleDelete = async (docId: string) => {
        try {
            await api.deleteDocument(docId);
            message.success("Dokumen berhasil dihapus!");
            mutateDocumentList();
        } catch (err: any) {
            message.error(err.message || "Gagal menghapus dokumen");
        }
    };

    const filteredDocuments = useMemo(() => {
        if (!documents) return [];

        return documents.filter((doc: Document) => {
            const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.docNo.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesFilter = statusFilter === 'All' || doc.status === statusFilter;

            return matchesSearch && matchesFilter;
        });
    }, [documents, searchTerm, statusFilter]);

    const columns = [
        {
            title: 'ID',
            dataIndex: 'docNo',
            key: 'docNo',
            sorter: (a: Document, b: Document) => a.docNo.localeCompare(b.docNo)
        },
        { title: 'JUDUL', dataIndex: 'title', key: 'title' },
        { title: 'STATUS', dataIndex: 'status', key: 'status', render: (status: string) => <Tag style={{ borderRadius: '16px', padding: '4px 24px' }} color={status === 'In Review' ? 'blue' : 'default'}>{status}</Tag> },
        {
            title: 'PRIORITAS',
            dataIndex: 'priority',
            key: 'priority',
            render: (priority: string) => {
                const color = priority === 'High' ? 'red' : priority === 'Medium' ? 'orange' : 'cyan';
                return <Tag  style={{ borderRadius: '16px', padding: '4px 24px' }} color={color}>{priority.toUpperCase()}</Tag>;
            }
        },
        { title: 'VERSI', dataIndex: 'version', key: 'version' },
        {
            title: 'AKSI',
            key: 'action',
            render: (_: any, record: Document) => (
                <Space>
                    <Tooltip title="Preview Document">
                        <Button
                            icon={<EyeOutlined />}
                            onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/dashboard/documents/preview/${record.id}`);
                            }}
                        />
                    </Tooltip>
                    <Tooltip title="Edit Document">
                        <Button icon={<EditOutlined />} onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/dashboard/documents/${record.id}`);
                        }} />
                    </Tooltip>
                    <Popconfirm
                        title="Hapus Dokumen"
                        description="Apakah Anda yakin ingin menghapus dokumen ini?"
                        onConfirm={(e) => { e?.stopPropagation(); handleDelete(record.id); }}
                        onCancel={(e) => e?.stopPropagation()}
                        okText="Ya, Hapus"
                        cancelText="Tidak"
                    >
                        <Button icon={<DeleteOutlined />} danger onClick={(e) => e.stopPropagation()} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    if (error) return <div>Gagal memuat dokumen.</div>;

    return (
        <Space direction="vertical" size="large" style={{ display: 'flex' }}>
            <Row justify="space-between" align="middle">
                <Typography.Title level={2} style={{ margin: 0 }}>Dashboard Requirement</Typography.Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                    Buat Requirement
                </Button>
            </Row>

            <Row justify="space-between" gutter={16}>
                <Col span={18}>
                    <Input.Search
                        placeholder="Cari berdasarkan Judul atau ID..."
                        onSearch={(value) => setSearchTerm(value)}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        allowClear
                    />
                </Col>
                <Col span={6}>
                    <Select
                        defaultValue="All"
                        style={{ width: '100%' }}
                        onChange={(value) => setStatusFilter(value)}
                    >
                        <Option value="All">All Status</Option>
                        <Option value="Draft">Draft</Option>
                        <Option value="In Review">In Review</Option>
                        <Option value="Approved">Approved</Option>
                    </Select>
                </Col>
            </Row>

            <Table
                columns={columns}
                dataSource={filteredDocuments}
                loading={isLoading}
                rowKey="id"
                onRow={(record) => ({
                    onClick: () => router.push(`/dashboard/documents/preview/${record.id}`),
                    style: { cursor: 'pointer' }
                })}
            />

            <Modal
                title="Buat Requirement Baru"
                open={isModalVisible}
                onOk={() => form.submit()}
                onCancel={() => setIsModalVisible(false)}
                confirmLoading={isCreating}
                destroyOnHidden
            >
                <Form form={form} onFinish={handleCreateDocument} layout="vertical">
                    <Form.Item name="template" label="Pilih Template" initialValue="">
                        <Select onChange={handleTemplateChange}>
                            <Option value="">Mulai dengan Dokumen Kosong</Option>
                            {templates?.map((template: DocumentTemplate) => (
                                <Option key={template.id} value={template.id}>
                                    {template.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="docNo" label="Document Number" rules={[{ required: true, message: 'Nomor dokumen wajib diisi!' }]}>
                        <Input placeholder="Contoh: BRD-001" />
                    </Form.Item>
                    <Form.Item name="title" label="Judul Requirement" rules={[{ required: true, message: 'Judul wajib diisi!' }]}>
                        <Input placeholder="Contoh: Implementasi Fitur SSO" />
                    </Form.Item>
                    <Form.Item name="priority" label="Prioritas" initialValue="Medium" rules={[{ required: true }]}>
                        <Select>
                            <Option value="High">High</Option>
                            <Option value="Medium">Medium</Option>
                            <Option value="Low">Low</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </Space>
    );
}