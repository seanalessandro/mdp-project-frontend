"use client";

import React, { useState, useEffect } from "react";
import { Button, Card, Col, Row, Statistic, Table, Tag, Typography, Space, Avatar, Dropdown, message } from "antd";
import { 
  FileTextOutlined, 
  UserOutlined, 
  ClockCircleOutlined, 
  PlusOutlined, 
  UsergroupAddOutlined, 
  BarChartOutlined, 
  SettingOutlined,
  LogoutOutlined,
  KeyOutlined
} from '@ant-design/icons';
import { useRouter } from "next/navigation";
import PaperIcon from "../../components/PaperIcon";
import ProtectedRoute from "../../components/ProtectedRoute";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import { AuthManager, User } from "../../utils/auth";
import { apiService } from "../../utils/api";

const { Title, Text } = Typography;

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await apiService.getProfile();
        setUser(profile);
      } catch (error) {
        console.error('Failed to load profile:', error);
        AuthManager.clearAuth();
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    const storedUser = AuthManager.getUser();
    if (storedUser) {
      setUser(storedUser);
      setLoading(false);
      loadUserProfile();
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = async () => {
    try {
      await apiService.logout();
      AuthManager.clearAuth();
      message.success('Logged out successfully');
      router.push('/login');
    } catch (error) {
      AuthManager.clearAuth();
      router.push('/login');
    }
  };

  const getDashboardByRole = () => {
    if (!user) return null;

    switch (user.role) {
      case 'admin':
        return getAdminDashboard();
      case 'manager':
        return getManagerDashboard();
      default:
        return getUserDashboard();
    }
  };

  const getAdminDashboard = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Total Users"
            value={150}
            prefix={<UserOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Active Sessions"
            value={42}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="System Reports"
            value={28}
            prefix={<BarChartOutlined />}
            valueStyle={{ color: '#722ed1' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <Card>
          <Statistic
            title="Configurations"
            value={12}
            prefix={<SettingOutlined />}
            valueStyle={{ color: '#fa8c16' }}
          />
        </Card>
      </Col>

      <Col xs={24}>
        <Card title="Quick Actions" className="mt-4">
          <Space wrap>
            <Button type="primary" icon={<UsergroupAddOutlined />}>
              Manage Users
            </Button>
            <Button icon={<SettingOutlined />}>
              System Settings
            </Button>
            <Button icon={<BarChartOutlined />}>
              View Reports
            </Button>
            <Button icon={<FileTextOutlined />}>
              Activity Logs
            </Button>
          </Space>
        </Card>
      </Col>
    </Row>
  );

  const getManagerDashboard = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={8}>
        <Card>
          <Statistic
            title="Team Members"
            value={25}
            prefix={<UserOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={8}>
        <Card>
          <Statistic
            title="Active Projects"
            value={8}
            prefix={<FileTextOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={8}>
        <Card>
          <Statistic
            title="Pending Reviews"
            value={5}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>

      <Col xs={24}>
        <Card title="Manager Actions" className="mt-4">
          <Space wrap>
            <Button type="primary" icon={<PlusOutlined />}>
              Create Project
            </Button>
            <Button icon={<UserOutlined />}>
              Team Management
            </Button>
            <Button icon={<BarChartOutlined />}>
              Project Reports
            </Button>
          </Space>
        </Card>
      </Col>
    </Row>
  );

  const getUserDashboard = () => (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={8}>
        <Card>
          <Statistic
            title="My Documents"
            value={12}
            prefix={<FileTextOutlined />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={8}>
        <Card>
          <Statistic
            title="Pending Tasks"
            value={3}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: '#faad14' }}
          />
        </Card>
      </Col>
      <Col xs={24} sm={12} lg={8}>
        <Card>
          <Statistic
            title="Completed"
            value={8}
            prefix={<FileTextOutlined />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Card>
      </Col>

      <Col xs={24}>
        <Card title="My Recent Documents" className="mt-4">
          <Table
            dataSource={[
              {
                key: '1',
                name: 'User Guide Document',
                status: 'Draft',
                lastModified: '2 hours ago',
              },
              {
                key: '2',
                name: 'Requirements Specification',
                status: 'Review',
                lastModified: '1 day ago',
              },
            ]}
            columns={[
              {
                title: 'Document Name',
                dataIndex: 'name',
                key: 'name',
              },
              {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (status: string) => {
                  const color = status === 'Draft' ? 'orange' : status === 'Review' ? 'blue' : 'green';
                  return <Tag color={color}>{status}</Tag>;
                },
              },
              {
                title: 'Last Modified',
                dataIndex: 'lastModified',
                key: 'lastModified',
              },
            ]}
            pagination={false}
            size="small"
          />
        </Card>
      </Col>
    </Row>
  );

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
    },
    {
      key: 'change-password',
      icon: <KeyOutlined />,
      label: 'Change Password',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    switch (key) {
      case 'change-password':
        setChangePasswordVisible(true);
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <PaperIcon className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <Text>Loading...</Text>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <PaperIcon className="w-8 h-8 text-blue-500 mr-3" />
                <Title level={4} className="mb-0">
                  MDP Project Dashboard
                </Title>
              </div>
              
              <div className="flex items-center space-x-4">
                <Text className="hidden sm:block">
                  Welcome, <strong>{user?.username}</strong>
                </Text>
                <Tag color={user?.role === 'admin' ? 'red' : user?.role === 'manager' ? 'blue' : 'green'}>
                  {user?.role?.toUpperCase()}
                </Tag>
                <Dropdown
                  menu={{
                    items: userMenuItems,
                    onClick: handleMenuClick,
                  }}
                  placement="bottomRight"
                >
                  <Avatar 
                    style={{ backgroundColor: '#1890ff', cursor: 'pointer' }} 
                    icon={<UserOutlined />}
                  />
                </Dropdown>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <Title level={2}>
              {user?.role === 'admin' 
                ? 'Administrator Dashboard' 
                : user?.role === 'manager' 
                ? 'Manager Dashboard' 
                : 'User Dashboard'}
            </Title>
            <Text type="secondary">
              {user?.last_login 
                ? `Last login: ${new Date(user.last_login).toLocaleString()}` 
                : 'Welcome to your dashboard'}
            </Text>
          </div>

          {getDashboardByRole()}
        </div>

        {/* Change Password Modal */}
        <ChangePasswordModal
          visible={changePasswordVisible}
          onCancel={() => setChangePasswordVisible(false)}
          onSuccess={() => setChangePasswordVisible(false)}
        />
      </div>
    </ProtectedRoute>
  );
}
