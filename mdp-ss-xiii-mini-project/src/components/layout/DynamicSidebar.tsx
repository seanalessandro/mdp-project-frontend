"use client";

import React, { useState } from 'react';
import { Layout, Menu, Spin, Alert } from 'antd';
import type { MenuProps } from 'antd';
import { 
  DesktopOutlined, TeamOutlined, UserOutlined, FileTextOutlined,
  PlusOutlined, BarChartOutlined, SettingOutlined, DatabaseOutlined,
  SafetyCertificateOutlined, GroupOutlined, AppstoreOutlined,
  UnorderedListOutlined, ControlOutlined, FolderOutlined,
  AuditOutlined, HomeOutlined, MenuOutlined
} from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import { useUserMenus } from '@/hooks/useUserMenus';
import { MenuWithChildren } from '@/lib/types';

const { Sider } = Layout;

// Expanded icon mapping for dynamic menu items
const iconMap: { [key: string]: React.ReactNode } = {
  'desktop': <DesktopOutlined />,
  'team': <TeamOutlined />,
  'user': <UserOutlined />,
  'file': <FileTextOutlined />,
  'plus': <PlusOutlined />,
  'chart': <BarChartOutlined />,
  'setting': <SettingOutlined />,
  'database': <DatabaseOutlined />,
  'safety': <SafetyCertificateOutlined />,
  'group': <GroupOutlined />,
  'appstore': <AppstoreOutlined />,
  'list': <UnorderedListOutlined />,
  'control': <ControlOutlined />,
  'folder': <FolderOutlined />,
  'audit': <AuditOutlined />,
  'home': <HomeOutlined />,
  'menu': <MenuOutlined />,
  'role': <SafetyCertificateOutlined />,
  'document': <FileTextOutlined />,
  'dashboard': <DesktopOutlined />,
  'manage': <ControlOutlined />,
  'admin': <SettingOutlined />,
  'user-management': <UserOutlined />,
  'role-management': <SafetyCertificateOutlined />,
  'menu-management': <MenuOutlined />,
  'system': <DatabaseOutlined />,
};

const getIconByName = (iconName: string): React.ReactNode => {
  const normalizedName = iconName?.toLowerCase() || '';
  return iconMap[normalizedName] || <FileTextOutlined />;
};

// Convert MenuWithChildren to Ant Design Menu items
const convertMenuToAntdItems = (menus: MenuWithChildren[]): MenuProps['items'] => {
  return menus.map((menu) => {
    const item = {
      key: menu.path,
      icon: getIconByName(menu.icon),
      label: menu.name,
      children: undefined as MenuProps['items'],
    };

    // If menu has children, add them recursively
    if (menu.children && menu.children.length > 0) {
      item.children = convertMenuToAntdItems(menu.children);
    } else {
      delete item.children;
    }

    return item;
  });
};

const DynamicSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { menus, loading, error } = useUserMenus();

  // Convert user menus to Ant Design menu format
  const menuItems = convertMenuToAntdItems(menus);

  // Handle menu item click
  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    router.push(key);
  };

  // Get selected keys (current path and parent paths)
  const getSelectedKeys = () => {
    // Find the menu item that matches current pathname
    const findMenuItem = (items: MenuWithChildren[], currentPath: string): string[] => {
      for (const item of items) {
        if (item.path === currentPath) {
          return [item.path];
        }
        if (item.children) {
          const childResult = findMenuItem(item.children, currentPath);
          if (childResult.length > 0) {
            return childResult;
          }
        }
      }
      return [];
    };

    return findMenuItem(menus, pathname);
  };

  // Get open keys (expanded parent menus)
  const getOpenKeys = () => {
    const openKeys: string[] = [];
    
    const findParentKeys = (items: MenuWithChildren[], currentPath: string): string[] => {
      for (const item of items) {
        if (item.children) {
          const childPaths = item.children.map(child => child.path);
          if (childPaths.includes(currentPath)) {
            openKeys.push(item.path);
            return [item.path];
          }
          const childResult = findParentKeys(item.children, currentPath);
          if (childResult.length > 0) {
            openKeys.push(item.path);
            return [item.path, ...childResult];
          }
        }
      }
      return [];
    };

    findParentKeys(menus, pathname);
    return openKeys;
  };

  if (error) {
    console.error('Sidebar error:', error);
    // Still show sidebar with error state but don't block the UI
  }

  return (
    <Sider 
      collapsible 
      collapsed={collapsed} 
      onCollapse={(value) => setCollapsed(value)}
      theme="dark"
    >
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
        {collapsed ? 'BRIDGE' : 'BRIDGE System'}
      </div>
      
      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <Spin size="small" />
        </div>
      ) : error ? (
        <div style={{ padding: '10px' }}>
          <Alert 
            message="Menu Error" 
            description="Failed to load menus" 
            type="warning" 
            showIcon={false}
          />
        </div>
      ) : (
        <Menu
          theme="dark"
          selectedKeys={getSelectedKeys()}
          defaultOpenKeys={getOpenKeys()}
          mode="inline"
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      )}
    </Sider>
  );
};

export default DynamicSidebar;
