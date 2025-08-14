"use client";

import React, { useState } from "react";
import { Modal, Form, Input, Select, Button, Table, Tag, Alert, Typography, Card, Row, Col, Space } from "antd"; // Import komponen Ant Design
import { LeftOutlined, SearchOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'; // Import ikon Ant Design

const { Option } = Select;

interface User {
    id: number;
    username: string;
    fullName: string;
    role: string;
    roleDisplay: string;
    status: 'active' | 'inactive';
}

export default function ManageUsersPage() {
    const [form] = Form.useForm(); // Menggunakan Form hook dari Ant Design

    const [users, setUsers] = useState<User[]>([
        { id: 1, username: "User APPS", fullName: "User APPS", role: "APPS", roleDisplay: "APPS/APPC", status: 'active' },
        { id: 2, username: "User APPC", fullName: "User APPC", role: "APPC", roleDisplay: "APPS/APPC", status: 'active' },
        { id: 3, username: "User Developer", fullName: "User Developer", role: "DEV", roleDisplay: "Developer", status: 'active' },
        { id: 4, username: "Dept Head", fullName: "Dept Head", role: "DH", roleDisplay: "Dept Head", status: 'active' },
    ]);

    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const handleSubmit = (values: any) => {
        if (editingUser) {
            setUsers(users.map(user =>
                user.id === editingUser.id
                    ? { ...user, username: values.username, fullName: values.fullName, role: values.role, roleDisplay: values.role }
                    : user
            ));
            setEditingUser(null);
        } else {
            const newUser: User = {
                id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
                username: values.username,
                fullName: values.fullName,
                role: values.role,
                roleDisplay: values.role,
                status: 'active'
            };
            setUsers([...users, newUser]);
        }

        form.resetFields(); // Reset form fields
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        form.setFieldsValue({ // Set form fields with user data
            username: user.username,
            fullName: user.fullName,
            role: user.role,
            password: "" // Password should not be pre-filled for security
        });
    };

    const handleDelete = (userId: number) => {
        Modal.confirm({
            title: 'Konfirmasi Hapus',
            content: 'Apakah Anda yakin ingin menghapus user ini?',
            okText: 'Ya',
            cancelText: 'Tidak',
            onOk: () => {
                setUsers(users.filter(user => user.id !== userId));
            },
        });
    };

    const handleCancelEdit = () => {
        setEditingUser(null);
        form.resetFields(); // Reset form fields
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.roleDisplay.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleColor = (role: string) => {
        switch (role) {
            case "APPS":
            case "APPC":
            case "DEV":
                return "green";
            case "DH":
                return "blue";
            default:
                return "default";
        }
    };

    const columns = [
        {
            title: 'No',
            key: 'no',
            render: (_: any, __: any, index: number) => index + 1,
            width: 50,
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            sorter: (a: User, b: User) => a.username.localeCompare(b.username),
        },
        {
            title: 'Nama Lengkap',
            dataIndex: 'fullName',
            key: 'fullName',
            sorter: (a: User, b: User) => a.fullName.localeCompare(b.fullName),
        },
        {
            title: 'Role',
            dataIndex: 'roleDisplay',
            key: 'roleDisplay',
            render: (roleDisplay: string, record: User) => (
                <Tag color={getRoleColor(record.role)}>
                    {roleDisplay}
                </Tag>
            ),
            sorter: (a: User, b: User) => a.roleDisplay.localeCompare(b.roleDisplay),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: 'active' | 'inactive') => (
                <Tag color={status === 'active' ? 'green' : 'red'}>
                    {status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                </Tag>
            ),
            sorter: (a: User, b: User) => a.status.localeCompare(b.status),
        },
        {
            title: 'Aksi',
            key: 'aksi',
            render: (_: any, record: User) => (
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
                                Panel Manajemen User
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
                        message={editingUser ? "User berhasil diupdate!" : "User berhasil ditambahkan!"}
                        type="success"
                        showIcon
                        closable
                        onClose={() => setShowSuccessMessage(false)}
                        className="mb-4"
                    />
                )}

                <Row gutter={[24, 24]}>
                    {/* Left Side - Form */}
                    <Col xs={24} lg={8}>
                        <Card title={<Typography.Title level={4} className="!text-lg !font-semibold !text-gray-800 !mb-0">{editingUser ? "Edit User" : "Tambah User Baru"}</Typography.Title>} className="rounded-lg shadow-md">
                            <Form
                                form={form}
                                layout="vertical"
                                onFinish={handleSubmit}
                                initialValues={editingUser || { role: "APPS/APPC" }}
                            >
                                <Form.Item
                                    label="Username"
                                    name="username"
                                    rules={[{ required: true, message: 'Mohon masukkan username!' }]}
                                >
                                    <Input placeholder="Masukkan username" />
                                </Form.Item>

                                <Form.Item
                                    label="Nama Lengkap"
                                    name="fullName"
                                    rules={[{ required: true, message: 'Mohon masukkan nama lengkap!' }]}
                                >
                                    <Input placeholder="Masukkan nama lengkap" />
                                </Form.Item>

                                <Form.Item
                                    label="Role"
                                    name="role"
                                    rules={[{ required: true, message: 'Mohon pilih role!' }]}
                                >
                                    <Select placeholder="Pilih Role">
                                        <Option value="APPS/APPC">APPS/APPC</Option>
                                        <Option value="Developer">Developer</Option>
                                        <Option value="Dept Head">Dept Head</Option>
                                        <Option value="Admin">Admin</Option>
                                    </Select>
                                </Form.Item>

                                <Form.Item
                                    label="Password"
                                    name="password"
                                    rules={[{ required: !editingUser, message: 'Mohon masukkan password!' }]}
                                >
                                    <Input.Password placeholder="Masukkan password" />
                                </Form.Item>
                                {editingUser && (
                                    <Typography.Text type="secondary" className="!text-xs !block !mb-4">Kosongkan jika tidak ingin mengubah password</Typography.Text>
                                )}

                                <Space>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                    >
                                        {editingUser ? "Update" : "Simpan"}
                                    </Button>

                                    {editingUser && (
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

                    {/* Right Side - User List */}
                    <Col xs={24} lg={16}>
                        <Card title={<Typography.Title level={4} className="!text-lg !font-semibold !text-gray-800 !mb-0">Daftar User</Typography.Title>} className="rounded-lg shadow-md">
                            <div className="mb-4">
                                <Input.Search
                                    placeholder="Cari user..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    enterButton={<SearchOutlined />}
                                    size="large"
                                />
                            </div>

                            <Table
                                columns={columns}
                                dataSource={filteredUsers}
                                rowKey="id"
                                pagination={{ pageSize: 10 }} // Tambahkan paginasi
                                scroll={{ x: 'max-content' }} // Untuk scroll horizontal pada layar kecil
                                locale={{ emptyText: searchTerm ? "Tidak ada user yang ditemukan" : "Belum ada user" }}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
        </>
    );
}
