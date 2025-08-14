"use client";

import React from 'react';
import { Avatar, Dropdown, Layout, Space, Tag, Typography } from 'antd';
import { UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAuth } from '@/context/AuthContext';

const { Header } = Layout;
const { Text } = Typography;

const AppHeader = () => {
    const { user, role, logout } = useAuth();

    const menuItems = [
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Logout',
            onClick: logout,
        },
    ];

    return (
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            <Space>
                <Text>Welcome, <strong>{user?.username}</strong></Text>
                <Tag color="blue">{role?.name}</Tag>
                <Dropdown menu={{ items: menuItems }} placement="bottomRight">
                    <Avatar style={{ cursor: 'pointer' }} icon={<UserOutlined />} />
                </Dropdown>
            </Space>
        </Header>
    );
};
export default AppHeader;