"use client";

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Spin, message } from 'antd';

export default function AuthCallbackPage() {
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const user = searchParams.get('user');
        const role = searchParams.get('role');

        if (token && user && role) {
            // Simpan semua data ke localStorage
            localStorage.setItem('token', token);
            localStorage.setItem('user', user);
            localStorage.setItem('role', role);

            message.success('Login with Google successful! Redirecting...');

            // --- PERBAIKAN DI SINI ---
            // Ganti router.push dan window.location.reload dengan ini:
            window.location.href = '/dashboard';
            // -------------------------

        } else {
            // Jika data tidak lengkap, kembali ke halaman login dengan pesan error
            message.error('Google authentication failed. Please try again.');
            window.location.href = '/auth/login';
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // useEffect ini hanya perlu berjalan sekali saat halaman dimuat

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
            <Spin tip="Authenticating..." size="large" />
        </div>
    );
}