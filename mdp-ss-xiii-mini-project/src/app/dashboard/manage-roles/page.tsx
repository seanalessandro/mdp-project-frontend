"use client";

import React, { useState, useEffect } from "react";
import {
  Modal,
  Form,
  Input,
  Button,
  Table,
  Tag,
  Alert,
  Typography,
  Card,
  Row,
  Col,
  Space,
  Popconfirm,
  message
} from "antd";
import { EditOutlined, DeleteOutlined, SearchOutlined, PlusOutlined } from '@ant-design/icons';
import useSWR from 'swr';
import * as api from '@/lib/api';
import { Role } from "@/lib/types";

export default function ManageRolesPage() {
  const [form] = Form.useForm();
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: roles, error, mutate, isLoading } = useSWR('/admin/roles', api.getRoles);

  useEffect(() => {
    // Mengisi form saat mode edit aktif
    if (editingRole) {
      form.setFieldsValue({
        name: editingRole.name,
        description: editingRole.description,
        permissions: editingRole.permissions.join(', ')
      });
    } else {
      form.resetFields();
    }
  }, [editingRole, form]);

  const handleOpenModal = (role?: Role) => {
    setEditingRole(role || null);
    setIsModalVisible(true);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    setEditingRole(null);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    const permissions = values.permissions ? values.permissions.split(',').map((p: string) => p.trim()).filter(Boolean) : [];
    const roleData = { ...values, permissions };

    try {
      if (editingRole) {
        await api.updateRole(editingRole.id, roleData);
        message.success("Peran berhasil diupdate!");
      } else {
        await api.createRole(roleData);
        message.success("Peran berhasil ditambahkan!");
      }
      mutate(); // Refresh data tabel
      handleCancelModal();
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const handleDelete = async (role: Role) => {
    if (role.isDefault) {
      message.error("Role default tidak dapat dihapus.");
      return;
    }
    try {
      await api.deleteRole(role.id);
      message.success("Peran berhasil dinonaktifkan!");
      mutate();
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const filteredRoles = roles?.filter((role: Role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      title: 'Nama Peran',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Role, b: Role) => a.name.localeCompare(b.name),
    },
    {
      title: 'Deskripsi',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Permissions',
      dataIndex: 'permissions',
      key: 'permissions',
      render: (perms: string[]) => <>{perms.map(p => <Tag key={p} color="blue">{p}</Tag>)}</>
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Aktif' : 'Tidak Aktif'}</Tag>
    },
    {
      title: 'Aksi',
      key: 'aksi',
      render: (_: any, record: Role) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleOpenModal(record)}>Edit</Button>
          <Popconfirm
            title="Nonaktifkan Peran"
            description="Apakah Anda yakin ingin menonaktifkan peran ini?"
            onConfirm={() => handleDelete(record)}
            okText="Ya"
            cancelText="Tidak"
            disabled={record.isDefault}
          >
            <Button icon={<DeleteOutlined />} danger disabled={record.isDefault}>Deactivate</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (error) return <Alert message="Error" description="Gagal memuat data peran." type="error" showIcon />;

  return (
    <Space direction="vertical" size="large" style={{ display: 'flex' }}>
      <Typography.Title level={2}>Panel Manajemen Role</Typography.Title>

      <Row gutter={[24, 24]}>
        {/* Kolom Kiri - Form Tambah/Edit */}
        <Col xs={24} lg={8}>
          <Card title={editingRole ? "Edit Peran" : "Tambah Peran Baru"} bordered={false} style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item name="name" label="Nama Peran" rules={[{ required: true, message: 'Nama peran tidak boleh kosong' }]}>
                <Input placeholder="Contoh: Marketing" />
              </Form.Item>
              <Form.Item name="description" label="Deskripsi">
                <Input.TextArea rows={3} placeholder="Penjelasan singkat tentang peran ini" />
              </Form.Item>
              <Form.Item name="permissions" label="Permissions (pisahkan dengan koma)">
                <Input placeholder="Contoh: content:create, content:read" />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">{editingRole ? "Update Peran" : "Simpan Peran"}</Button>
                  {editingRole && <Button onClick={handleCancelModal}>Batal</Button>}
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Kolom Kanan - Tabel Daftar Peran */}
        <Col xs={24} lg={16}>
          <Card title="Daftar Peran" bordered={false} style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}>
            <Input.Search
              placeholder="Cari peran..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              enterButton={<SearchOutlined />}
              size="large"
              className="mb-4"
            />
            <Table
              columns={columns}
              dataSource={filteredRoles}
              rowKey="id"
              loading={isLoading}
              pagination={{ pageSize: 5 }}
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Modal tidak lagi diperlukan di sini karena kita menggunakan Card */}
    </Space>
  );
}