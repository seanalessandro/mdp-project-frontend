"use client";

import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Table,
  Tag,
  Typography,
  Card,
  Row,
  Col,
  Space,
  Popconfirm,
  message,
  Select,
  Alert,
  Switch // <-- Pastikan Switch di-import
} from "antd";
import { EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import useSWR from 'swr';
import * as api from '@/lib/api';
import { Role } from "@/lib/types";

export default function ManageRolesPage() {
  const [form] = Form.useForm();
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Mengambil daftar role
  const { data: roles, error: rolesError, mutate: mutateRoles, isLoading: isLoadingRoles } = useSWR('/admin/roles', api.getRoles);

  // Mengambil daftar permission dari API untuk dropdown
  const { data: allPermissions, error: permissionsError, isLoading: isLoadingPermissions } = useSWR('/admin/permissions', api.getPermissions);

  useEffect(() => {
    // Mengisi form saat mode edit aktif
    if (editingRole) {
      form.setFieldsValue(editingRole);
    } else {
      form.resetFields();
    }
  }, [editingRole, form]);

  const handleCancelEdit = () => {
    setEditingRole(null);
    form.resetFields();
  };

  const handleSubmit = async (values: any) => {
    const roleData = { ...values };
    try {
      if (editingRole) {
        await api.updateRole(editingRole.id, roleData);
        message.success("Peran berhasil diupdate!");
      } else {
        await api.createRole(roleData);
        message.success("Peran berhasil ditambahkan!");
      }
      mutateRoles(); // Memuat ulang data tabel
      handleCancelEdit(); // Mengosongkan form
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const handleDelete = async (roleId: string) => {
    try {
      await api.deleteRole(roleId);
      message.success("Peran berhasil dihapus!");
      mutateRoles();
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const handleStatusChange = async (role: Role, checked: boolean) => {
    try {
      await api.updateRoleStatus(role.id, checked);
      message.success(`Status peran ${role.name} berhasil diubah!`);
      mutateRoles();
    } catch (err: any) {
      message.error(err.message);
      // Revert the switch state on failure if needed
      mutateRoles();
    }
  };

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
      render: (perms: string[]) => <>{(perms || []).map(p => <Tag key={p} color="blue">{p}</Tag>)}</>
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: Role) => (
        <Switch
          checkedChildren="Aktif"
          unCheckedChildren="Nonaktif"
          checked={isActive}
          onChange={(checked) => handleStatusChange(record, checked)}
        />
      )
    },
    {
      title: 'Aksi',
      key: 'aksi',
      render: (_: any, record: Role) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => setEditingRole(record)}>Edit</Button>
          <Popconfirm
            title="Hapus Peran"
            description="Apakah Anda yakin ingin menghapus peran ini secara permanen?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya, Hapus"
            cancelText="Tidak"
            disabled={record.isDefault}
          >
            <Button icon={<DeleteOutlined />} danger disabled={record.isDefault}>Hapus</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (rolesError || permissionsError) return <Alert message="Error" description="Gagal memuat data." type="error" showIcon />;

  const filteredRoles = roles?.filter((role: Role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Space direction="vertical" size="large" style={{ display: 'flex' }}>
      <Typography.Title level={2}>Panel Manajemen Role</Typography.Title>

      <Row gutter={[24, 24]}>
        {/* Kolom Kiri - Form Tambah/Edit */}
        <Col xs={24} lg={8}>
          <Card title={editingRole ? `Edit Peran: ${editingRole.name}` : "Tambah Peran Baru"} bordered={false}>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item name="name" label="Nama Peran" rules={[{ required: true, message: 'Nama peran tidak boleh kosong' }]}>
                <Input placeholder="Contoh: Marketing" />
              </Form.Item>
              <Form.Item name="description" label="Deskripsi">
                <Input.TextArea rows={3} placeholder="Penjelasan singkat" />
              </Form.Item>

              <Form.Item name="permissions" label="Permissions">
                <Select
                  mode="multiple"
                  allowClear
                  style={{ width: '100%' }}
                  placeholder="Pilih permissions"
                  loading={isLoadingPermissions}
                >
                  {(allPermissions || []).map((permission: string) => (
                    <Select.Option key={permission} value={permission}>
                      {permission}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    {editingRole ? "Update Peran" : "Simpan Peran"}
                  </Button>
                  {editingRole && <Button onClick={handleCancelEdit}>Batal</Button>}
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Kolom Kanan - Tabel Daftar Peran */}
        <Col xs={24} lg={16}>
          <Card title="Daftar Role" bordered={false}>
            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
              <Input.Search
                placeholder="Cari peran..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Table
                columns={columns}
                dataSource={filteredRoles}
                rowKey="id"
                loading={isLoadingRoles}
                pagination={{ pageSize: 5 }}
                scroll={{ x: 'max-content' }}
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}