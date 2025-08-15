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
  Switch // <-- Make sure Switch is imported
} from "antd";
import { EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import useSWR from 'swr';
import * as api from '@/lib/api';
import { Role } from "@/lib/types";

export default function ManageRolesPage() {
  const [form] = Form.useForm();
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetching the list of roles
  const { data: roles, error: rolesError, mutate: mutateRoles, isLoading: isLoadingRoles } = useSWR('/admin/roles', api.getRoles);

  // Fetching the list of permissions from the API for the dropdown
  const { data: allPermissions, error: permissionsError, isLoading: isLoadingPermissions } = useSWR('/admin/permissions', api.getPermissions);

  useEffect(() => {
    // Populate the form when edit mode is active
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
        message.success("Role updated successfully!");
      } else {
        await api.createRole(roleData);
        message.success("Role added successfully!");
      }
      mutateRoles(); // Reload the table data
      handleCancelEdit(); // Clear the form
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const handleDelete = async (roleId: string) => {
    try {
      await api.deleteRole(roleId);
      message.success("Role deleted successfully!");
      mutateRoles();
    } catch (err: any) {
      message.error(err.message);
    }
  };

  const handleStatusChange = async (role: Role, checked: boolean) => {
    try {
      await api.updateRoleStatus(role.id, checked);
      message.success(`Status for role ${role.name} changed successfully!`);
      mutateRoles();
    } catch (err: any) {
      message.error(err.message);
      // Revert the switch state on failure if needed
      mutateRoles();
    }
  };

  const columns = [
    {
      title: 'Role Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Role, b: Role) => a.name.localeCompare(b.name),
    },
    {
      title: 'Description',
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
          checkedChildren="Active"
          unCheckedChildren="Inactive"
          checked={isActive}
          onChange={(checked) => handleStatusChange(record, checked)}
        />
      )
    },
    {
      title: 'Actions',
      key: 'action', // 'aksi' changed to 'action' for convention
      render: (_: any, record: Role) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => setEditingRole(record)}>Edit</Button>
          <Popconfirm
            title="Delete Role"
            description="Are you sure you want to permanently delete this role?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes, Delete"
            cancelText="No"
            disabled={record.isDefault}
          >
            <Button icon={<DeleteOutlined />} danger disabled={record.isDefault}>Delete</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (rolesError || permissionsError) return <Alert message="Error" description="Failed to load data." type="error" showIcon />;

  const filteredRoles = roles?.filter((role: Role) =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Space direction="vertical" size="large" style={{ display: 'flex' }}>
      <Typography.Title level={2}>Role Management Panel</Typography.Title>

      <Row gutter={[24, 24]}>
        {/* Left Column - Add/Edit Form */}
        <Col xs={24} lg={8}>
          <Card title={editingRole ? `Edit Role: ${editingRole.name}` : "Add New Role"} bordered={false}>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item name="name" label="Role Name" rules={[{ required: true, message: 'Role name cannot be empty' }]}>
                <Input placeholder="Example: Marketing" />
              </Form.Item>
              <Form.Item name="description" label="Description">
                <Input.TextArea rows={3} placeholder="Brief explanation" />
              </Form.Item>

              <Form.Item name="permissions" label="Permissions">
                <Select
                  mode="multiple"
                  allowClear
                  style={{ width: '100%' }}
                  placeholder="Select permissions"
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
                    {editingRole ? "Update Role" : "Save Role"}
                  </Button>
                  {editingRole && <Button onClick={handleCancelEdit}>Cancel</Button>}
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Right Column - Roles List Table */}
        <Col xs={24} lg={16}>
          <Card title="List of Roles" bordered={false}>
            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
              <Input.Search
                placeholder="Search Roles..."
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