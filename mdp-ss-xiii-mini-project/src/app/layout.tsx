// /src/app/layout.tsx
import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AuthProvider } from '@/context/AuthContext';
import { App } from 'antd'; // <-- 1. Import komponen App
import './globals.css';

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" suppressHydrationWarning={true}>
    <body>
      <AntdRegistry>
        <App>

          <AuthProvider>
            {children}
          </AuthProvider>
        </App>

      </AntdRegistry>
    </body>
  </html>
);

export default RootLayout;