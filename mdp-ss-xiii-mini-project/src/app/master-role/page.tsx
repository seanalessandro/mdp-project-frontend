"use client";

import React, { useState } from "react";
import { Modal, Form, Input, Button, Table, Tag, Alert, Typography, Card, Row, Col, Space } from "antd"; // Import komponen Ant Design
import { LeftOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'; // Import ikon Ant Design

interface Role {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

export default function ManageRolesPage() {
  const [form] = Form.useForm(); // Menggunakan Form hook dari Ant Design

  const [roles, setRoles] = useState<Role[]>([
    { id: 1, name: "Admin", description: "Hak akses penuh ke sistem", status: 'active' },
    { id: 2, name: "Developer", description: "Mengembangkan dan memelihara aplikasi", status: 'active' },
    { id: 3, name: "Dept Head", description: "Mengelola tim dan menyetujui laporan", status: 'active' },
    { id: 4, name: "User APPS", description: "Pengguna aplikasi umum", status: 'active' },
    { id: 5, name: "User APPC", description: "Pengguna aplikasi khusus", status: 'inactive' },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (values: any) => { // Menerima values dari Form Ant Design
    if (!values.name.trim()) {
      Modal.info({
        title: 'Peringatan',
        content: 'Nama peran tidak boleh kosong!',
      });
      return;
    }

    if (editingRole) {
      setRoles(roles.map(role =>
        role.id === editingRole.id
          ? { ...role, name: values.name, description: values.description }
          : role
      ));
      setEditingRole(null);
    } else {
      const newRole: Role = {
        id: roles.length > 0 ? Math.max(...roles.map(r => r.id)) + 1 : 1,
        name: values.name,
        description: values.description,
        status: 'active'
      };
      setRoles([...roles, newRole]);
    }

    form.resetFields(); // Reset form fields
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    form.setFieldsValue({ // Set form fields with role data
      name: role.name,
      description: role.description
    });
  };

  const handleDelete = (roleId: number) => {
    Modal.confirm({
      title: 'Konfirmasi Hapus',
      content: 'Apakah Anda yakin ingin menghapus peran ini?',
      okText: 'Ya',
      cancelText: 'Tidak',
      onOk: () => {
        setRoles(roles.filter(role => role.id !== roleId));
      },
    });
  };

  const handleCancelEdit = () => {
    setEditingRole(null);
    form.resetFields(); // Reset form fields
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: 'active' | 'inactive') => {
    return status === 'active' ? 'green' : 'red';
  };

  const columns = [
    {
      title: 'No',
      key: 'no',
      render: (_: any, __: any, index: number) => index + 1,
      width: 50,
    },
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
      render: (description: string) => description || '-',
      sorter: (a: Role, b: Role) => (a.description || '').localeCompare(b.description || ''),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: 'active' | 'inactive') => (
        <Tag color={getStatusColor(status)}>
          {status === 'active' ? 'Aktif' : 'Tidak Aktif'}
        </Tag>
      ),
      sorter: (a: Role, b: Role) => a.status.localeCompare(b.status),
    },
    {
      title: 'Aksi',
      key: 'aksi',
      render: (_: any, record: Role) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            type="primary"
            ghost
          >
            Edit
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
            type="primary"
            danger
          >
            Hapus
          </Button>
        </Space>
      ),
      width: 150,
    },
  ];

  return (
    <>
      {/* Navigation Bar */}
      <Card className="-mx-6 -mt-6 rounded-t-xl rounded-b-none shadow-sm border-b">
        <Row align="middle" justify="space-between">
          <Col>
            <Space>
              <Button
                type="text"
                icon={<LeftOutlined />}
                onClick={() => window.location.href = "/dashboard"}
                className="!text-white hover:!text-blue-200"
              />
              <Typography.Title level={3} className="!text-xl !font-semibold !text-gray-800 !mb-0">
                Panel Manajemen Role
              </Typography.Title>
            </Space>
          </Col>
          <Col>
            <Button
              type="primary"
              danger
              onClick={() => window.location.href = "/login"}
            >
              Logout
            </Button>
          </Col>
        </Row>
      </Card>

      <div className="max-w-7xl mx-auto p-6">
        {showSuccessMessage && (
          <Alert
            message={editingRole ? "Peran berhasil diupdate!" : "Peran berhasil ditambahkan!"}
            type="success"
            showIcon
            closable
            onClose={() => setShowSuccessMessage(false)}
            className="mb-4"
          />
        )}

        <Row gutter={[24, 24]}>
          {/* Left Side - Form untuk Tambah/Edit Role */}
          <Col xs={24} lg={8}>
            <Card title={<Typography.Title level={4} className="!text-lg !font-semibold !text-gray-800 !mb-0">{editingRole ? "Edit Peran" : "Tambah Peran Baru"}</Typography.Title>} className="rounded-lg shadow-md">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={editingRole || {}} // Pastikan initialValues diatur
              >
                <Form.Item
                  label="Nama Peran"
                  name="name"
                  rules={[{ required: true, message: 'Mohon masukkan nama peran!' }]}
                >
                  <Input placeholder="Masukkan nama peran (misal: Admin)" />
                </Form.Item>

                <Form.Item
                  label="Deskripsi"
                  name="description"
                >
                  <Input.TextArea rows={3} placeholder="Deskripsi singkat peran ini (opsional)" />
                </Form.Item>

                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                  >
                    {editingRole ? "Update Peran" : "Simpan Peran"}
                  </Button>

                  {editingRole && (
                    <Button
                      onClick={handleCancelEdit}
                    >
                      Batal
                    </Button>
                  )}
                </Space>
              </Form>
            </Card>
          </Col>

          {/* Right Side - Daftar Peran */}
          <Col xs={24} lg={16}>
            <Card title={<Typography.Title level={4} className="!text-lg !font-semibold !text-gray-800 !mb-0">Daftar Peran</Typography.Title>} className="rounded-lg shadow-md">
              <div className="mb-4">
                <Input.Search
                  placeholder="Cari peran..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  enterButton={<SearchOutlined />}
                  size="large"
                />
              </div>

              <Table
                columns={columns}
                dataSource={filteredRoles}
                rowKey="id"
                pagination={{ pageSize: 10 }} // Tambahkan paginasi
                scroll={{ x: 'max-content' }} // Untuk scroll horizontal pada layar kecil
                locale={{ emptyText: searchTerm ? "Tidak ada peran yang ditemukan" : "Belum ada peran" }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}
