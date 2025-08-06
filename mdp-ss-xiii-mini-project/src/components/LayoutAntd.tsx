"use client";

import React, { useState, useMemo } from 'react';
import {
    DesktopOutlined,
    FileOutlined,
    UserOutlined,
    DashboardOutlined, // Menambahkan ikon Dashboard
    TeamOutlined, // Menambahkan ikon untuk Manage Users
    SolutionOutlined, // Menambahkan ikon untuk Master Role
} from '@ant-design/icons';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import type { MenuProps } from 'antd';
import { usePathname, useRouter } from 'next/navigation'; // Import hooks dari Next.js

const { Header, Content, Footer, Sider } = Layout;

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
    label: React.ReactNode,
    key: React.Key, // Key akan menjadi path
    icon?: React.ReactNode,
    children?: MenuItem[],
): MenuItem {
    return {
        key,
        icon,
        children,
        label,
    } as MenuItem;
}

// Definisikan struktur halaman/rute Anda
const pageRoutes = [
    getItem('Dashboard', '/dashboard', <DashboardOutlined />),
    getItem('Manajemen User', '/manage-users', <TeamOutlined />),
    getItem('Master Role', '/master-role', <SolutionOutlined />),
    // Anda bisa menambahkan item menu lain di sini, termasuk sub-menu
    // getItem('Pengaturan', 'sub-settings', <SettingOutlined />, [
    //   getItem('Profil', '/settings/profile'),
    //   getItem('Keamanan', '/settings/security'),
    // ]),
];

interface LayoutAntdProps {
    children: React.ReactNode;
}

const LayoutAntd: React.FC<LayoutAntdProps> = ({ children }) => {
    const [collapsed, setCollapsed] = useState<boolean>(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const pathname = usePathname(); // Mendapatkan jalur URL saat ini
    const router = useRouter(); // Mendapatkan objek router untuk navigasi

    // Fungsi untuk mendapatkan selectedKeys dan openKeys berdasarkan pathname
    const getMenuKeys = useMemo(() => {
        const keys: string[] = [];
        let openKeys: string[] = [];

        // Fungsi rekursif untuk mencari key dan openKeys
        const findKeys = (items: MenuItem[], currentPath: string) => {
            for (const item of items) {
                if (item && typeof item.key === 'string') {
                    // Perbaikan: Tambahkan type guard untuk properti children dan pastikan itu array
                    if ('children' in item && Array.isArray(item.children)) {
                        // Karena kita tahu 'item' sekarang memiliki 'children' yang adalah array,
                        // kita bisa menggunakannya dengan aman.
                        if (currentPath.startsWith(item.key) && item.key !== '/') {
                            keys.push(item.key);
                            openKeys.push(item.key);
                            findKeys(item.children, currentPath);
                        } else if (item.children.some(child => child && typeof child.key === 'string' && currentPath.startsWith(child.key))) { // Perbaikan di sini
                            openKeys.push(item.key);
                            findKeys(item.children, currentPath);
                        }
                    } else if (currentPath.startsWith(item.key) && item.key !== '/') {
                        keys.push(item.key);
                    }
                }
            }
        };

        findKeys(pageRoutes, pathname);

        // Filter openKeys agar hanya yang relevan dan unik
        openKeys = Array.from(new Set(openKeys));

        // Jika pathname adalah root, pastikan default selected key adalah dashboard
        if (pathname === '/') {
            keys.push('/dashboard');
        }

        return { selectedKeys: keys, openKeys };
    }, [pathname]);

    const { selectedKeys, openKeys } = getMenuKeys;

    // Fungsi untuk menangani klik menu
    const onMenuClick = (e: { key: string }) => {
        router.push(e.key); // Navigasi ke jalur yang dipilih
    };

    // Fungsi untuk membuat item breadcrumb
    const getBreadcrumbItems = useMemo(() => {
        const pathSegments = pathname.split('/').filter(segment => segment); // Pisahkan path menjadi segmen
        const breadcrumbs: { title: string; href?: string }[] = [{ title: 'Home', href: '/' }];

        let currentPath = '';
        pathSegments.forEach((segment, index) => {
            currentPath += `/${segment}`;
            // Cari label yang sesuai dari pageRoutes
            const menuItem = pageRoutes.find(item => item && typeof item.key === 'string' && item.key === currentPath);

            // Perbaikan: Tambahkan type guard untuk properti label
            let title = (menuItem && 'label' in menuItem && typeof menuItem.label === 'string')
                ? menuItem.label
                : segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '); // Default jika tidak ditemukan di menu

            // Jika ini segmen terakhir, tidak perlu href
            if (index === pathSegments.length - 1) {
                breadcrumbs.push({ title: title });
            } else {
                breadcrumbs.push({ title: title, href: currentPath });
            }
        });

        return breadcrumbs;
    }, [pathname]);


    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
                <div className="demo-logo-vertical" style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', borderRadius: 6 }} />
                <Menu
                    theme="dark"
                    selectedKeys={selectedKeys} // Gunakan selectedKeys dinamis
                    defaultOpenKeys={openKeys} // Gunakan openKeys dinamis
                    mode="inline"
                    items={pageRoutes} // Gunakan pageRoutes sebagai item menu
                    onClick={onMenuClick} // Tambahkan handler klik
                />
            </Sider>
            <Layout>
                <Header style={{ padding: 0, background: colorBgContainer }} />
                <Content style={{ margin: '0 16px' }}>
                    <Breadcrumb style={{ margin: '16px 0' }} items={getBreadcrumbItems} /> {/* Gunakan breadcrumbs dinamis */}
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        {children}
                    </div>
                </Content>
                <Footer style={{ textAlign: 'center' }}>
                    Ant Design ©{new Date().getFullYear()} Created by Ant UED
                </Footer>
            </Layout>
        </Layout>
    );
};

export default LayoutAntd;
