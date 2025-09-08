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
    Switch,
    Spin 
} from "antd";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import useSWR from 'swr';
import * as api from '@/lib/api';
import { Role, MenuType, RoleMenuMapping, RoleMenuMappingRequest } from "@/lib/types";

const { Option } = Select;
const { Title } = Typography;

export default function ManageRoleMenuMappingPage() {
    const [form] = Form.useForm();
    const [editingMapping, setEditingMapping] = useState<RoleMenuMapping | null>(null);

    // Fetching all necessary data
    const { data: roles, error: rolesError, mutate: mutateRoles, isLoading: isLoadingRoles } = useSWR('/admin/roles', api.getRoles);
    const { data: menus, error: menusError, mutate: mutateMenus, isLoading: isLoadingMenus } = useSWR('/admin/menus', api.getMenus);
    const { data: mappings, error: mappingsError, mutate: mutateMappings, isLoading: isLoadingMappings } = useSWR('/admin/role-menu-mappings', api.getRoleMenuMappings);

    useEffect(() => {
        if (editingMapping) {
            form.setFieldsValue({
                roleId: editingMapping.roleId,
                menuIds: editingMapping.menuIds,
                isActive: editingMapping.isActive,
            });
        } else {
            form.resetFields();
        }
    }, [editingMapping, form]);

    const handleCancelEdit = () => {
        setEditingMapping(null);
        form.resetFields();
    };

    const handleSubmit = async (values: any) => {
        try {
            if (editingMapping) {
                // Update existing mapping
                await api.updateRoleMenuMapping(editingMapping.id, values);
                message.success("Mapping updated successfully!");
            } else {
                // Create new mapping
                await api.createRoleMenuMapping(values);
                message.success("Mapping added successfully!");
            }
            mutateMappings(); // Reload data
            handleCancelEdit(); // Clear form
        } catch (err: any) {
            message.error(err.message || "Failed to save mapping.");
        }
    };

    const handleDelete = async (mappingId: string) => {
        try {
            await api.deleteRoleMenuMapping(mappingId);
            message.success("Mapping deleted successfully!");
            mutateMappings();
        } catch (err: any) {
            message.error(err.message || "Failed to delete mapping.");
        }
    };

    if (rolesError || menusError || mappingsError) {
        return <Alert message="Error" description="Failed to load data from server." type="error" showIcon />;
    }

    const getRoleName = (roleId: string) => roles?.find((r: Role) => r.id === roleId)?.name || "N/A";
    const getMenuNames = (menuIds: string[]) => {
        return menuIds.map(menuId => menus?.find((m: MenuType) => m.id === menuId)?.name || "N/A");
    };

    const columns = [
        {
            title: 'Role',
            dataIndex: 'roleId',
            key: 'roleId',
            render: (roleId: string) => getRoleName(roleId),
        },
        {
            title: 'Menus',
            dataIndex: 'menuIds',
            key: 'menuIds',
            render: (menuIds: string[]) => (
                <Space size={[0, 8]} wrap>
                    {getMenuNames(menuIds).map(name => (
                        <Tag key={name} color="blue">{name}</Tag>
                    ))}
                </Space>
            ),
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive: boolean) => <Tag color={isActive ? "green" : "red"}>{isActive ? "Active" : "Inactive"}</Tag>,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: RoleMenuMapping) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => setEditingMapping(record)}>Edit</Button>
                    <Popconfirm
                        title="Delete Mapping"
                        description="Are you sure you want to delete this mapping?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Yes, Delete"
                        cancelText="No"
                    >
                        <Button icon={<DeleteOutlined />} danger>Delete</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Space direction="vertical" size="large" style={{ display: 'flex' }}>
            <Title level={2}>Manage Role-Menu Mappings</Title>

            <Row gutter={[24, 24]}>
                <Col xs={24} lg={8}>
                    <Card title={editingMapping ? "Edit Mapping" : "Add New Mapping"}>
                        <Form form={form} layout="vertical" onFinish={handleSubmit}>
                            <Form.Item name="roleId" label="Select Role" rules={[{ required: true, message: 'Please select a role' }]}>
                                <Select placeholder="Select a role" disabled={!!editingMapping} loading={isLoadingRoles}>
                                    {roles?.map((role: Role) => (
                                        <Option key={role.id} value={role.id}>{role.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item name="menuIds" label="Select Menus">
                                <Select mode="multiple" placeholder="Select menus" loading={isLoadingMenus}>
                                    {menus?.map((menu: MenuType) => (
                                        <Option key={menu.id} value={menu.id}>{menu.name}</Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item name="isActive" label="Status" valuePropName="checked">
                                <Switch />
                            </Form.Item>

                            <Form.Item>
                                <Space>
                                    <Button type="primary" htmlType="submit" loading={isLoadingMappings}>
                                        {editingMapping ? "Update Mapping" : "Save Mapping"}
                                    </Button>
                                    {editingMapping && <Button onClick={handleCancelEdit}>Cancel</Button>}
                                </Space>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>

                <Col xs={24} lg={16}>
                    <Card title="Role-Menu Mappings List">
                        <Spin spinning={isLoadingMappings}>
                            <Table
                                columns={columns}
                                dataSource={mappings}
                                rowKey="id"
                                pagination={{ pageSize: 5 }}
                                scroll={{ x: 'max-content' }}
                            />
                        </Spin>
                    </Card>
                </Col>
            </Row>
        </Space>
    );
}