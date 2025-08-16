"use client";

import React from 'react';
import { Layout } from 'antd';
import AppSidebar from '../../components/layout/AppSidebar';
import AppHeader from '../../components/layout/AppHeader';
// import '../editor.css';

const { Content } = Layout;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <Layout style={{ minHeight: '100vh' }}>
            <AppSidebar />
            <Layout>
                <AppHeader />
                <Content style={{ margin: '24px 16px 0' }}>
                    <div style={{ padding: 24, minHeight: 360, background: '#fff', borderRadius: 8 }}>
                        {children}
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}