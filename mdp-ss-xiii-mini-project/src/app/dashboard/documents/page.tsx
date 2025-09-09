"use client";

import React, { useState, useRef, useMemo } from 'react';
import { Button, Table, Space, Typography, Popconfirm, message, Input, Row, Select, Tag, Tooltip, Col, Card } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import type { InputRef } from 'antd';
import type { ColumnType } from 'antd/es/table';
import type { FilterConfirmProps } from 'antd/es/table/interface';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import * as api from '@/lib/api';
import { Document } from '@/lib/types';
import CreateDocumentModal from '@/components/documents/CreateDocumentModal';

const { Option } = Select;

export default function DocumentsPage() {
    const router = useRouter();
    const { data: documents, error: docError, mutate: mutateDocuments, isLoading: isLoadingDocs } = useSWR('/documents', api.getMyDocuments);

    const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // 🔎 state untuk global search & status filter
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // 🔎 state untuk column search
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef<InputRef>(null);

    const handleSearch = (selectedKeys: string[], confirm: (param?: FilterConfirmProps) => void, dataIndex: string) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters?: () => void) => {
        clearFilters && clearFilters();
        setSearchText('');
    };

    // helper search per kolom
    const getColumnSearchProps = (dataIndex: keyof Document): ColumnType<Document> => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${String(dataIndex)}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys as string[], confirm, String(dataIndex))}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys as string[], confirm, String(dataIndex))}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered: boolean) => (
            <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                ? String(record[dataIndex]).toLowerCase().includes((value as string).toLowerCase())
                : false,
        onFilterDropdownOpenChange: (visible) => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: (text: string) =>
            searchedColumn === dataIndex ? (
                <span style={{ backgroundColor: '#ffc069', padding: 0 }}>{text}</span>
            ) : (
                text
            ),
    });

    // 🔎 Global filtering (berdasarkan search utama + status)
    const filteredDocuments = useMemo(() => {
        if (!documents) return [];
        return documents.filter((doc: Document) =>
            (doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                doc.docNo.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (statusFilter === 'All' || doc.status === statusFilter)
        );
    }, [documents, searchTerm, statusFilter]);

    const handleTemplateSelect = async (templateId: string) => {
        setIsProcessing(true);
        setIsTemplateModalVisible(false);
        try {
            const newDoc = await api.createDocument(templateId);
            message.success("Dokumen baru berhasil dibuat!");
            mutateDocuments();
            router.push(`/dashboard/documents/${newDoc.id}`);
        } catch (err: any) {
            message.error(err.message || "Gagal membuat dokumen");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleDelete = async (docId: string) => {
        try {
            await api.deleteDocument(docId);
            message.success("Dokumen berhasil dihapus!");
            mutateDocuments();
        } catch (err: any) {
            message.error(err.message || "Gagal menghapus dokumen");
        }
    };

    const columns = [
        {
            title: 'DOCUMENT NO',
            dataIndex: 'docNo',
            key: 'docNo',
            sorter: (a: Document, b: Document) => a.docNo.localeCompare(b.docNo),
            ...getColumnSearchProps('docNo'),
        },
        {
            title: 'JUDUL',
            dataIndex: 'title',
            key: 'title',
            ...getColumnSearchProps('title'),
        },
        {
            title: 'STATUS',
            dataIndex: 'status',
            key: 'status',
            filters: [
                { text: 'Draft', value: 'Draft' },
                { text: 'In Review', value: 'In Review' },
                { text: 'Approved', value: 'Approved' },
                { text: 'Implemented', value: 'Implemented' },
            ],
            onFilter: (value: any, record: Document) => record.status === value,
            render: (status: string) => {
                let color = 'default';
                if (status === 'In Review') color = 'blue';
                if (status === 'Approved') color = 'yellow';
                if (status === 'Implemented') color = 'green';
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: 'PRIORITAS',
            dataIndex: 'priority',
            key: 'priority',
            filters: [
                { text: 'High', value: 'High' },
                { text: 'Medium', value: 'Medium' },
                { text: 'Low', value: 'Low' },
            ],
            onFilter: (value: any, record: Document) => record.priority === value,
            render: (priority: string) => {
                const color = priority === 'High' ? 'red' : priority === 'Medium' ? 'orange' : 'green';
                return <Tag color={color}>{priority}</Tag>;
            }
        },
        {
            title: 'VERSI',
            dataIndex: 'version',
            key: 'version',
            sorter: (a: Document, b: Document) => (a.version ?? 1) - (b.version ?? 1),
            render: (version: number) => version ? version.toFixed(1) : '1.0'
        },
        {
            title: 'AKSI',
            key: 'action',
            render: (_: any, record: Document) => (
                <Space>
                    <Tooltip title="Edit Document">
                        <Button
                            icon={<EditOutlined />}
                            onClick={(e) => { e.stopPropagation(); router.push(`/dashboard/documents/${record.id}`); }}
                        />
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

    if (docError) return <div>Gagal memuat dokumen.</div>;

    return (
        <Space direction="vertical" size="large" style={{ display: 'flex' }}>
            <Row justify="space-between" align="middle">
                <div>
                    <Typography.Title level={2} style={{ margin: 0 }}>Dashboard Requirement</Typography.Title>
                    <Typography.Text type="secondary">Anda login sebagai: 1st Layer Support. Membuat & Mengajukan Requirement</Typography.Text>
                </div>
                <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => setIsTemplateModalVisible(true)} loading={isProcessing}>
                    Buat Requirement
                </Button>
            </Row>

            {/* 🔎 Search utama */}
            <Row justify="space-between" gutter={16}>
                <Col flex="auto">
                    <Input.Search
                        placeholder="Cari berdasarkan Judul atau ID..."
                        size="large"
                        onSearch={setSearchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        allowClear
                    />
                </Col>
                <Col flex="200px">
                    <Select defaultValue="All" style={{ width: '100%' }} size="large" onChange={setStatusFilter}>
                        <Option value="All">All Status</Option>
                        <Option value="Draft">Draft</Option>
                        <Option value="In Review">In Review</Option>
                        <Option value="Approved">Approved</Option>
                        <Option value="Implemented">Implemented</Option>
                    </Select>
                </Col>
            </Row>

            <Card bordered={false}>
                <Table
                    columns={columns}
                    dataSource={filteredDocuments} // hasil global filter
                    loading={isLoadingDocs}
                    rowKey="id"
                    onRow={(record) => ({
                        onClick: () => router.push(`/dashboard/documents/preview/${record.id}`),
                        style: { cursor: 'pointer' }
                    })}
                />
            </Card>

            <CreateDocumentModal
                open={isTemplateModalVisible}
                onCancel={() => setIsTemplateModalVisible(false)}
                onSelect={handleTemplateSelect}
            />
        </Space>
    );
}
