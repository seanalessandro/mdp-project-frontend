"use client";

import React, { useState, useEffect } from "react";
import { 
  Modal, Form, Input, Select, Button, Table, Tag, Typography, Card, 
  Row, Col, Space, message, Switch, Tooltip, Popconfirm
} from "antd";
import { 
  LeftOutlined, EditOutlined, DeleteOutlined, 
  PlusOutlined, ReloadOutlined, MailOutlined, UserOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { 
  getUsers, getRoles, createUser, updateUser, updateUserRole, 
  toggleUserStatus, resetUserPassword
} from "@/lib/api";

const { Option } = Select;
const { Text } = Typography;

interface BackendUser {
  _id?: string;
  id?: string;
  username?: string;
  email?: string;
  fullName?: string;
  role?: {
    _id?: string;
    id?: string;
    name?: string;
    displayName?: string;
  };
  unitKerja?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface User {
  _id: string; // Keep as _id for internal use
  id?: string; // Also support id from backend
  username: string;
  email: string;
  fullName: string;
  role: {
    _id: string;
    id?: string; // Also support id from backend
    name: string;
    displayName: string;
  };
  unitKerja?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Role {
  id: string; // API returns 'id' not '_id'
  name: string;
  description?: string; // API includes description
  isActive: boolean;
  displayName?: string; // Make optional since API might not have this
}

export default function ManageUsersPage() {
  const [form] = Form.useForm();
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Debug roles state
  console.log('Current roles state:', roles, 'Length:', roles.length);

  // Load users and roles on component mount
  const loadUsers = async (
    page?: number,
    pageSize?: number,
    search?: string,
    role?: string,
    status?: string
  ) => {
    if (loading) return; // Prevent concurrent requests
    
    try {
      setLoading(true);
      
      // Use provided params or current state values
      const currentPage = page ?? pagination.current;
      const currentPageSize = pageSize ?? pagination.pageSize;
      const currentSearch = search ?? searchTerm;
      const currentRole = role ?? selectedRole;
      const currentStatus = status ?? selectedStatus;
      
      const params = {
        page: currentPage,
        limit: currentPageSize,
        search: currentSearch || undefined,
        role: currentRole || undefined,
        status: currentStatus || undefined,
      };
      
      const response = await getUsers(params);
      
      if (response?.data) {
        console.log('Raw user data from backend:', response.data);
        
        // Ensure each user has required fields for proper key generation
        const validatedUsers = response.data.map((user: BackendUser, index: number): User => {
          console.log(`Processing user ${index}:`, user);
          
          const processedUser: User = {
            _id: user._id || user.id || `temp-id-${index}`, // Try _id first, then id, then temp
            id: user.id || user._id, // Also set id for compatibility
            username: user.username || '',
            email: user.email || '',
            fullName: user.fullName || '',
            role: user.role ? {
              _id: user.role._id || user.role.id || '',
              id: user.role.id || user.role._id,
              name: user.role.name || '',
              displayName: user.role.displayName || user.role.name || 'Unknown'
            } : { _id: '', id: '', name: '', displayName: 'Unknown' },
            unitKerja: user.unitKerja,
            isActive: user.isActive !== undefined ? user.isActive : true,
            createdAt: user.createdAt || '',
            updatedAt: user.updatedAt || '',
          };
          
          console.log(`Processed user ${index}:`, processedUser);
          return processedUser;
        });
        
        setUsers(validatedUsers);
        setPagination(prev => ({
          ...prev,
          current: currentPage,
          pageSize: currentPageSize,
          total: response.pagination?.total || response.data.length,
        }));
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      message.error(`Gagal memuat data user: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    try {
      console.log('Loading roles...');
      const response = await getRoles();
      console.log('Roles response:', response);
      
      // The API returns roles array directly, not wrapped in 'data'
      if (Array.isArray(response)) {
        console.log('Setting roles directly:', response);
        setRoles(response);
      } else if (response?.data && Array.isArray(response.data)) {
        console.log('Setting roles from data:', response.data);
        setRoles(response.data);
      } else {
        console.log('No valid roles data found in response');
        setRoles([]); // Set empty array as fallback
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error loading roles:', error);
      message.error(`Gagal memuat data role: ${errorMessage}`);
      setRoles([]); // Set empty array on error
    }
  };

  // Wrapper function for manual refresh
  const handleRefresh = () => {
    loadUsers();
  };

  // Effect for initial load
  useEffect(() => {
    // Initial load of users
    const initialLoadUsers = async () => {
      setLoading(true);
      try {
        const params = {
          page: 1,
          limit: 10,
        };
        
        const response = await getUsers(params);
        
        if (response?.data) {
          const validatedUsers = response.data.map((user: BackendUser, index: number): User => ({
            _id: user._id || user.id || `temp-id-${index}`, // Try _id first, then id, then temp
            id: user.id || user._id, // Also set id for compatibility
            username: user.username || '',
            email: user.email || '',
            fullName: user.fullName || '',
            role: user.role ? {
              _id: user.role._id || user.role.id || '',
              id: user.role.id || user.role._id,
              name: user.role.name || '',
              displayName: user.role.displayName || user.role.name || 'Unknown'
            } : { _id: '', id: '', name: '', displayName: 'Unknown' },
            unitKerja: user.unitKerja,
            isActive: user.isActive !== undefined ? user.isActive : true,
            createdAt: user.createdAt || '',
            updatedAt: user.updatedAt || '',
          }));
          
          setUsers(validatedUsers);
          setPagination(prev => ({
            ...prev,
            current: 1,
            pageSize: 10,
            total: response.pagination?.total || response.data.length,
          }));
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        message.error(`Gagal memuat data user: ${errorMessage}`);
      } finally {
        setLoading(false);
      }
    };
    
    initialLoadUsers();
    loadRoles();
  }, []); // Only run once on mount

  // Effect for filter changes with debouncing
  useEffect(() => {
    if (searchTerm !== "" || selectedRole !== "" || selectedStatus !== "") {
      const timeoutId = setTimeout(() => {
        // Create params for filtered search
        const params = {
          page: 1, // Reset to page 1
          limit: pagination.pageSize,
          search: searchTerm || undefined,
          role: selectedRole || undefined,
          status: selectedStatus || undefined,
        };
        
        setLoading(true);
        getUsers(params)
          .then(response => {
            if (response?.data) {
              const validatedUsers = response.data.map((user: BackendUser, index: number): User => ({
                _id: user._id || user.id || `temp-id-${index}`, // Try _id first, then id, then temp
                id: user.id || user._id, // Also set id for compatibility
                username: user.username || '',
                email: user.email || '',
                fullName: user.fullName || '',
                role: user.role ? {
                  _id: user.role._id || user.role.id || '',
                  id: user.role.id || user.role._id,
                  name: user.role.name || '',
                  displayName: user.role.displayName || user.role.name || 'Unknown'
                } : { _id: '', id: '', name: '', displayName: 'Unknown' },
                unitKerja: user.unitKerja,
                isActive: user.isActive !== undefined ? user.isActive : true,
                createdAt: user.createdAt || '',
                updatedAt: user.updatedAt || '',
              }));
              
              setUsers(validatedUsers);
              setPagination(prev => ({
                ...prev,
                current: 1,
                total: response.pagination?.total || response.data.length,
              }));
            }
          })
          .catch(error => {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            message.error(`Gagal memuat data user: ${errorMessage}`);
          })
          .finally(() => setLoading(false));
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [searchTerm, selectedRole, selectedStatus, pagination.pageSize]); // Direct dependencies

  // FR-5.2.2.1: Admin dapat membuat akun user baru
  const handleCreateUser = async (values: {
    username: string;
    email: string;
    fullName: string;
    roleId: string;
    unitKerja?: string;
  }) => {
    try {
      setCreating(true);
      await createUser({
        username: values.username,
        email: values.email,
        fullName: values.fullName,
        roleId: values.roleId,
        unitKerja: values.unitKerja,
      });
      
      message.success("User berhasil dibuat!");
      form.resetFields();
      setIsModalVisible(false);
      loadUsers();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      message.error(`Gagal membuat user: ${errorMessage}`);
    } finally {
      setCreating(false);
    }
  };

  // Update user information
  const handleUpdateUser = async (values: {
    username: string;
    email: string;
    fullName: string;
    unitKerja?: string;
  }) => {
    if (!editingUser) return;
    
    try {
      setCreating(true);
      await updateUser(editingUser._id, {
        username: values.username,
        email: values.email,
        fullName: values.fullName,
        unitKerja: values.unitKerja,
      });
      
      message.success("User berhasil diupdate!");
      form.resetFields();
      setIsModalVisible(false);
      setEditingUser(null);
      loadUsers();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      message.error(`Gagal mengupdate user: ${errorMessage}`);
    } finally {
      setCreating(false);
    }
  };

  // FR-5.2.2.3: Admin dapat mengubah role user
  const handleChangeRole = async (userId: string, newRoleId: string) => {
    try {
      await updateUserRole(userId, newRoleId);
      message.success("Role user berhasil diubah!");
      loadUsers();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      message.error(`Gagal mengubah role: ${errorMessage}`);
    }
  };

  // FR-5.2.2.2: Admin dapat menonaktifkan/mengaktifkan user
  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await toggleUserStatus(userId, !currentStatus);
      message.success(`User berhasil ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}!`);
      loadUsers();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      message.error(`Gagal mengubah status user: ${errorMessage}`);
    }
  };

  // FR-5.2.2.5: Admin dapat mereset password dan mengirim via email
  const handleResetPassword = async (userId: string, userEmail: string) => {
    try {
      await resetUserPassword(userId);
      message.success(`Password berhasil direset dan dikirim ke ${userEmail}!`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      message.error(`Gagal mereset password: ${errorMessage}`);
    }
  };

  // FR-5.2.2.4: Admin tidak dapat menghapus user, hanya nonaktifkan
  const handleDeactivateUser = (user: User) => {
    Modal.confirm({
      title: 'Konfirmasi Nonaktifkan User',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Apakah Anda yakin ingin menonaktifkan user <strong>{user.fullName}</strong>?</p>
          <p className="text-gray-500 text-sm">
            Sesuai kebijakan sistem, user tidak dapat dihapus permanent, 
            hanya dapat dinonaktifkan untuk menjaga integritas data.
          </p>
        </div>
      ),
      okText: 'Ya, Nonaktifkan',
      cancelText: 'Batal',
      okType: 'danger',
      onOk: () => handleToggleStatus(user._id, user.isActive),
    });
  };

  const showCreateModal = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const showEditModal = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      unitKerja: user.unitKerja,
    });
    setIsModalVisible(true);
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  };

  const handleTableChange = (paginationConfig: { current?: number; pageSize?: number }) => {
    setPagination(prev => ({
      ...prev,
      current: paginationConfig.current || 1,
      pageSize: paginationConfig.pageSize || 10,
    }));
  };

  const columns = [
    {
      title: 'No',
      key: 'no',
      render: (_: unknown, __: unknown, index: number) => 
        (pagination.current - 1) * pagination.pageSize + index + 1,
      width: 60,
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      sorter: true,
      render: (username: string) => (
        <Space>
          <UserOutlined />
          <Text strong>{username}</Text>
        </Space>
      ),
    },
    {
      title: 'Nama Lengkap',
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => (
        <Space>
          <MailOutlined />
          <Text>{email}</Text>
        </Space>
      ),
    },
    {
      title: 'Unit Kerja',
      dataIndex: 'unitKerja',
      key: 'unitKerja',
      render: (unitKerja: string) => unitKerja || '-',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: User['role'], record: User) => (
        <Select
          value={role?._id}
          style={{ width: 150 }}
          onChange={(newRoleId) => handleChangeRole(record._id, newRoleId)}
          size="small"
          placeholder="Select Role"
        >
          {roles.map(r => (
            <Option key={`role-${r.id}`} value={r.id}>
              <Tag color="blue">{r.displayName || r.name}</Tag>
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: User) => (
        <Switch
          checked={isActive}
          onChange={() => handleToggleStatus(record._id, isActive)}
          checkedChildren="Aktif"
          unCheckedChildren="Nonaktif"
          size="small"
        />
      ),
    },
    {
      title: 'Aksi',
      key: 'actions',
      render: (_: unknown, record: User) => (
        <Space size="small">
          <Tooltip title="Edit User">
            <Button
              icon={<EditOutlined />}
              onClick={() => showEditModal(record)}
              type="primary"
              ghost
              size="small"
            />
          </Tooltip>

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
                className="!text-gray-700 hover:!text-blue-600"
              />
              <Typography.Title level={3} className="!text-xl !font-semibold !text-gray-800 !mb-0">
                Manajemen User
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

      <div className="max-w-full mx-auto p-6">
        <Card className="rounded-lg shadow-md">
          {/* Filter Controls */}
          <Row gutter={[16, 16]} className="mb-4" justify="space-between" align="middle">
            <Col xs={24} sm={12} md={8}>
              <Input.Search
                placeholder="Cari user (nama, username, email)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                allowClear
              />
            </Col>
            
            <Col xs={24} sm={12} md={8}>
              <Space style={{ float: 'right' }}>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefresh}
                  loading={loading}
                >
                  Refresh
                </Button>
                
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={showCreateModal}
                >
                  Tambah User
                </Button>
              </Space>
            </Col>
          </Row>

          {/* Users Table */}
          <Table
            columns={columns}
            dataSource={users}
            rowKey={(record) => record._id || record.username || Math.random().toString()}
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} dari ${total} user`,
            }}
            onChange={handleTableChange}
            scroll={{ x: 1200 }}
            locale={{ 
              emptyText: searchTerm ? "Tidak ada user yang ditemukan" : "Belum ada user" 
            }}
          />
        </Card>

        {/* Create/Edit User Modal */}
        <Modal
          title={editingUser ? "Edit User" : "Tambah User Baru"}
          open={isModalVisible}
          onCancel={handleModalCancel}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={editingUser ? handleUpdateUser : handleCreateUser}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Username"
                  name="username"
                  rules={[
                    { required: true, message: 'Username wajib diisi!' },
                    { min: 3, message: 'Username minimal 3 karakter!' }
                  ]}
                >
                  <Input placeholder="Masukkan username" />
                </Form.Item>
              </Col>
              
              <Col span={12}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Email wajib diisi!' },
                    { type: 'email', message: 'Format email tidak valid!' }
                  ]}
                >
                  <Input placeholder="Masukkan email" disabled={!!editingUser} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              label="Nama Lengkap"
              name="fullName"
              rules={[{ required: true, message: 'Nama lengkap wajib diisi!' }]}
            >
              <Input placeholder="Masukkan nama lengkap" />
            </Form.Item>

            <Row gutter={16}>
              <Col span={12}>
                {!editingUser && (
                  <Form.Item
                    label="Role"
                    name="roleId"
                    rules={[{ required: true, message: 'Role wajib dipilih!' }]}
                  >
                    <Select placeholder="Pilih Role">
                      {roles.map(role => (
                        <Option key={`modal-role-${role.id}`} value={role.id}>
                          {role.displayName || role.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                )}
              </Col>
              
              <Col span={editingUser ? 24 : 12}>
                <Form.Item
                  label="Unit Kerja"
                  name="unitKerja"
                >
                  <Input placeholder="Masukkan unit kerja (opsional)" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item className="mb-0 text-right">
              <Space>
                <Button onClick={handleModalCancel}>
                  Batal
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={creating}
                >
                  {editingUser ? "Update" : "Simpan"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
}
