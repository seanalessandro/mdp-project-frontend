// /src/app/layout.tsx
import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" suppressHydrationWarning={true}>
    <body>
      <AntdRegistry>
        <AuthProvider>
          {children}
        </AuthProvider>
      </AntdRegistry>
    </body>
  </html>
);

export default RootLayout;