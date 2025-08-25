"use client";

import React, { useState } from 'react';
import { Layout, Menu } from 'antd';
import { 
  DesktopOutlined, TeamOutlined, UserOutlined, FileTextOutlined,
  PlusOutlined, BarChartOutlined, SettingOutlined, DatabaseOutlined
} from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getRoleNavigationItems } from '@/utils/roleRoutes';

const { Sider } = Layout;

// Icon mapping for dynamic menu items
const iconMap = {
  DesktopOutlined: <DesktopOutlined />,
  TeamOutlined: <TeamOutlined />,
  UserOutlined: <UserOutlined />,
  FileTextOutlined: <FileTextOutlined />,
  PlusOutlined: <PlusOutlined />,
  BarChartOutlined: <BarChartOutlined />,
  SettingOutlined: <SettingOutlined />,
  DatabaseOutlined: <DatabaseOutlined />,
};

const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { role } = useAuth();

  // Get role-specific navigation items
  const navigationItems = getRoleNavigationItems(role);
  
  // Convert to Ant Design menu format
  const menuItems = navigationItems.map(item => ({
    key: item.key,
    icon: iconMap[item.icon as keyof typeof iconMap] || <FileTextOutlined />,
    label: item.label,
  }));

  return (
    <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)}>
      <div style={{ 
        height: 32, 
        margin: 16, 
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: 4,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 'bold',
        fontSize: collapsed ? '12px' : '14px'
      }}>
        {collapsed ? 'MDP' : 'MDP System'}
      </div>
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