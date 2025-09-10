// /src/app/layout.tsx
import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AuthProvider } from '@/context/AuthContext';
import { TokenRefreshProvider } from '@/components/TokenRefreshProvider';
import { App } from 'antd'; // <-- 1. Import komponen App
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'BRIDGE',
  description: 'Enterprise Document Management System with Role-Based Access Control',
  keywords: 'document management, MDP, enterprise, workflow',
  authors: [{ name: 'MDP Team' }],
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" suppressHydrationWarning={true}>
    <body>
      <AntdRegistry>
        <App>
          <AuthProvider>
            <TokenRefreshProvider>
              {children}
            </TokenRefreshProvider>
          </AuthProvider>
        </App>
      </AntdRegistry>
    </body>
  </html>
);

export default RootLayout;