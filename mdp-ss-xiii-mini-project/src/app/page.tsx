"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Spin } from 'antd';

export default function RootPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Jangan lakukan apa-apa sampai status otentikasi selesai diperiksa
    if (isLoading) {
      return;
    }

    if (isAuthenticated) {
      // Jika sudah login, ganti halaman saat ini dengan dashboard
      router.replace('/dashboard');
    } else {
      // Jika belum login, ganti halaman saat ini dengan login
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Tampilkan loading spinner selama proses pengecekan dan redirect
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <Spin size="large" />
    </div>
  );
}