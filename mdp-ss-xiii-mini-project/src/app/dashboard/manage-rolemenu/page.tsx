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
    Switch
} from "antd";
import { EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import useSWR from 'swr';
import * as api from "../../../lib/api";
import { RoleMenuMapping, Role, MenuType, RoleMenuMappingRequest } from "../../../lib/types";

const { Title, Text } = Typography;
const { Option } = Select;

export default function ManageRoleMenuMappingPage() {
    const [form] = Form.useForm();
    const [editingMapping, setEditingMapping] = useState<RoleMenuMapping | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Fetching all data
    const { data: roles, error: rolesError, isLoading: isLoadingRoles } = useSWR('/admin/roles', api.getRoles);
    const { data: menus, error: menusError, isLoading: isLoadingMenus } = useSWR('/admin/menus', api.getMenus);
    const { data: mappings, error: mappingsError, mutate: mutateMappings, isLoading: isLoadingMappings } = useSWR('/admin/role-menus', api.getRoleMenus);

    useEffect(() => {
        if (editingMapping) {
            form.setFieldsValue({
                roleId: editingMapping.roleId,
                menuId: editingMapping.menuId,
                isActive: editingMapping.isActive,
            });
        } else {
            form.resetFields();
        }
    }, [editingMapping, form]);

    const getRoleNameById = (id: string): string => {
        const role = roles?.find((r: Role) => r.id === id);
        return role ? role.name : 'Unknown Role';
    };

    const getMenuNameById = (id: string): string => {
        const menu = menus?.find((m: MenuType) => m.id === id);
        return menu ? menu.name : 'Unknown Menu';
    };

    const handleCancelEdit = () => {
        setEditingMapping(null);
        form.resetFields();
    };

    const handleSubmit = async (values: RoleMenuMappingRequest) => {
        try {
            if (editingMapping) {
                await api.updateRoleMenuMapping(editingMapping.id, values);
                message.success("Pemetaan berhasil diperbarui!");
            } else {
                await api.createRoleMenuMapping(values);
                message.success("Pemetaan berhasil ditambahkan!");
            }
            mutateMappings();
            handleCancelEdit();
        } catch (err: any) {
            message.error(err.message || "Gagal menyimpan pemetaan.");
        }
    };

    const handleDelete = async (mappingId: string) => {
        try {
            await api.deleteRoleMenuMapping(mappingId);
            message.success("Pemetaan berhasil dihapus!");
            mutateMappings();
        } catch (err: any) {
            message.error(err.message || "Gagal menghapus pemetaan.");
        }
    };

    const columns = [
        {
            title: 'Role',
            key: 'roleId',
            render: (_: any, record: RoleMenuMapping) => (
                <Text>{getRoleNameById(record.roleId)}</Text>
            )
        },
        {
            title: 'Menu',
            key: 'menuId',
            render: (_: any, record: RoleMenuMapping) => (
                <Text>{getMenuNameById(record.menuId)}</Text>
            )
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive: boolean) => (
                <Tag color={isActive ? "green" : "red"}>
                    {isActive ? "Aktif" : "Tidak Aktif"}
                </Tag>
            )
        },
        {
            title: 'Aksi',
            key: 'action',
            render: (_: any, record: RoleMenuMapping) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => setEditingMapping(record)}>
                        Edit
                    </Button>
                    <Popconfirm
                        title="Hapus Pemetaan"
                        description="Apakah Anda yakin ingin menghapus pemetaan ini secara permanen?"
                        onConfirm={() => handleDelete(record.id)}
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

    if (rolesError || menusError || mappingsError) {
        return <Alert message="Error" description="Gagal memuat data. Mohon coba lagi." type="error" showIcon />;
    }

    const filteredMappings = mappings?.filter((mapping: RoleMenuMapping) =>
        getRoleNameById(mapping.roleId).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getMenuNameById(mapping.menuId).toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Space direction="vertical" size="large" style={{ display: 'flex' }}>
            <Title level={2}>Manajemen Pemetaan Peran & Menu</Title>

            <Row gutter={[24, 24]}>
                {/* Kolom Kiri - Form Tambah/Edit */}
                <Col xs={24} lg={8}>
                    <Card
                        title={editingMapping ? "Edit Pemetaan" : "Tambah Pemetaan Baru"}
                        bordered={false}
                    >
                        <Form form={form} layout="vertical" onFinish={handleSubmit}>
                            <Form.Item
                                name="roleId"
                                label="Role"
                                rules={[{ required: true, message: 'Pilih role' }]}
                            >
                                <Select placeholder="Pilih Role" loading={isLoadingRoles}>
                                    {(roles || []).map((role: Role) => (
                                        <Option key={role.id} value={role.id}>{role.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="menuId"
                                label="Menu"
                                rules={[{ required: true, message: 'Pilih menu' }]}
                            >
                                <Select placeholder="Pilih Menu" loading={isLoadingMenus}>
                                    {(menus || []).map((menu: MenuType) => (
                                        <Option key={menu.id} value={menu.id}>{menu.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item name="isActive" label="Status" valuePropName="checked">
                                <Switch
                                    checkedChildren="Aktif"
                                    unCheckedChildren="Tidak Aktif"
                                    defaultChecked={true}
                                />
                            </Form.Item>

                            <Form.Item>
                                <Space>
                                    <Button type="primary" htmlType="submit">
                                        {editingMapping ? "Perbarui" : "Simpan"}
                                    </Button>
                                    {editingMapping && <Button onClick={handleCancelEdit}>Batal</Button>}
                                </Space>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>

                {/* Kolom Kanan - Tabel Pemetaan */}
                <Col xs={24} lg={16}>
                    <Card title="Daftar Pemetaan" bordered={false}>
                        <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
                            <Input.Search
                                placeholder="Cari berdasarkan Role atau Menu"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            <Table
                                columns={columns}
                                dataSource={filteredMappings}
                                rowKey="id"
                                loading={isLoadingMappings || isLoadingRoles || isLoadingMenus}
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
