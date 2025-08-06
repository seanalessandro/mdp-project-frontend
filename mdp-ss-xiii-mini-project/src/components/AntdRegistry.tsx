"use client";

import React from 'react';
import { AntdRegistry } from '@ant-design/nextjs-registry';

/**
 * Komponen ini membungkus aplikasi Anda dengan AntdRegistry untuk memastikan
 * gaya CSS-in-JS Ant Design dikumpulkan dengan benar selama Server-Side Rendering (SSR)
 * dan diinjeksikan ke HTML. Ini membantu mencegah kesalahan hidrasi.
 */
const StyledComponentsRegistry = ({ children }: { children: React.ReactNode }) => (
    <AntdRegistry>{children}</AntdRegistry>
);

export default StyledComponentsRegistry;
