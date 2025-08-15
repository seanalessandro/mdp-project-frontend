"use client";

import React, { useState } from 'react';
import { Button, Table, Space, Typography, Popconfirm, message, Modal, Input, Row } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import * as api from '@/lib/api';
import { Document } from '@/lib/types'; // Pastikan tipe Document sudah ada di types.ts

export default function DocumentsPage() {
    const router = useRouter();
    const { data: documents, error, mutate, isLoading } = useSWR('/documents', api.getMyDocuments);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const handleCreateDocument = async () => {
        if (!newTitle.trim()) {
            message.error("Judul dokumen tidak boleh kosong.");
            return;
        }
        setIsCreating(true);
        try {
            const newDoc = await api.createDocument(newTitle);
            message.success("Dokumen baru berhasil dibuat!");
            setIsModalVisible(false);
            setNewTitle('');
            router.push(`/dashboard/documents/${newDoc.id}`);
        } catch (err: any) {
            message.error(err.message);
        } finally {
            setIsCreating(false);
        }
    };

    const columns = [
        {
            title: 'Judul Dokumen',
            dataIndex: 'title',
            key: 'title',
            sorter: (a: Document, b: Document) => a.title.localeCompare(b.title),
        },
        {
            title: 'Dibuat Pada',
            dataIndex: 'createdOn',
            key: 'createdOn',
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Terakhir Diubah',
            dataIndex: 'modifiedOn',
            key: 'modifiedOn',
            render: (date: string) => new Date(date).toLocaleString(),
        },
        {
            title: 'Aksi',
            key: 'action',
            render: (_: any, record: Document) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => router.push(`/dashboard/documents/${record.id}`)}>
                        Edit
                    </Button>
                    <Popconfirm
                        title="Hapus Dokumen"
                        description="Apakah Anda yakin ingin menghapus dokumen ini?"
                        // onConfirm={() => handleDelete(record.id)}
                        okText="Ya, Hapus"
                        cancelText="Tidak"
                    >
                        <Button icon={<DeleteOutlined />} danger>
                            Hapus
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    if (error) return <div>Gagal memuat dokumen.</div>;

    return (
        <Space direction="vertical" size="large" style={{ display: 'flex' }}>
            <Row justify="space-between" align="middle">
                <Typography.Title level={2}>Dokumen Saya</Typography.Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                    Buat Dokumen Baru
                </Button>
            </Row>
            <Table
                columns={columns}
                dataSource={documents}
                loading={isLoading}
                rowKey="id"
            />
            <Modal
                title="Buat Dokumen Baru"
                open={isModalVisible}
                onOk={handleCreateDocument}
                onCancel={() => setIsModalVisible(false)}
                confirmLoading={isCreating}
            >
                <Input
                    placeholder="Masukkan judul dokumen..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    onPressEnter={handleCreateDocument}
                />
            </Modal>
        </Space>
    );
}