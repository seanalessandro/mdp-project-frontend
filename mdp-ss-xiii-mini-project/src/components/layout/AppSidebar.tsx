"use client";

import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { DesktopOutlined, TeamOutlined, UserOutlined, FileTextOutlined  } from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';

const { Sider } = Layout;

// --- PERBAIKI KEY DI SINI ---
const menuItems = [
  { key: '/dashboard', icon: <DesktopOutlined />, label: 'Dashboard' },
  { key: '/dashboard/documents', icon: <FileTextOutlined />, label: 'Documents' }, // <-- BARIS BARU
  { key: '/dashboard/manage-users', icon: <TeamOutlined />, label: 'Manage Users' },
  { key: '/dashboard/manage-roles', icon: <UserOutlined />, label: 'Master Role' },
];
// -----------------------------

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
      <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
      <Menu
        theme="dark"
        selectedKeys={[pathname]}
        mode="inline"
        items={menuItems}
        onClick={({ key }) => router.push(key)}
      />
    </Sider>
  );
};
export default AppSidebar;