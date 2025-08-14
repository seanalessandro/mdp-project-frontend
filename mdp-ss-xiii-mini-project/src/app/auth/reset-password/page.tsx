"use client";

import React, { useState, useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
// Remove PaperIcon import as it's not needed

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3033/api';

export default function ResetPasswordPage() {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        setToken(tokenParam);
    }, [searchParams]);

    const handleResetPassword = async (values: { password: string; confirmPassword: string }) => {
        if (values.password !== values.confirmPassword) {
            message.error('Password tidak cocok');
            return;
        }

        if (!token) {
            message.error('Token reset tidak ditemukan');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token,
                    password: values.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Gagal reset password');
            }

            message.success('Password berhasil direset! Anda sekarang dapat login dengan password baru.');
            setTimeout(() => {
                router.push('/auth/login');
            }, 2000);
        } catch (error: any) {
            message.error(error.message || 'Gagal reset password');
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '20px'
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                    padding: '2rem',
                    maxWidth: '28rem',
                    width: '100%',
                    textAlign: 'center'
                }}>
                    <div style={{ color: '#dc2626', marginBottom: '1rem' }}>
                        <h1>Link Reset Tidak Valid</h1>
                        <p>Link reset password ini tidak valid atau sudah kadaluarsa.</p>
                    </div>
                    <Link 
                        href="/auth/forgot-password"
                        style={{ color: '#3b82f6', textDecoration: 'none' }}
                    >
                        Minta link reset baru
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px'
        }}>
            <div style={{
                background: 'white',
                borderRadius: '0.75rem',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                padding: '2rem',
                maxWidth: '28rem',
                width: '100%'
            }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ 
                        width: '64px', 
                        height: '64px', 
                        backgroundColor: '#3b82f6', 
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        color: 'white'
                    }}>
                        🔐
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                        Reset Password Anda
                    </h1>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                        Masukkan password baru Anda
                    </p>
                </div>

                <Form form={form} onFinish={handleResetPassword} layout="vertical">
                    <Form.Item 
                        name="password" 
                        label="Password Baru" 
                        rules={[
                            { required: true, message: 'Password wajib diisi' },
                            { min: 8, message: 'Password minimal 8 karakter' }
                        ]}
                    >
                        <Input.Password 
                            placeholder="Masukkan password baru" 
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item 
                        name="confirmPassword" 
                        label="Konfirmasi Password" 
                        rules={[
                            { required: true, message: 'Konfirmasi password wajib diisi' }
                        ]}
                    >
                        <Input.Password 
                            placeholder="Konfirmasi password baru" 
                            size="large"
                        />
                    </Form.Item>

                    <div style={{ marginBottom: '1rem', padding: '0.75rem', backgroundColor: '#f9fafb', borderRadius: '0.375rem' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#374151', marginBottom: '0.25rem' }}>
                            Persyaratan password:
                        </p>
                        <ul style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, paddingLeft: '1rem' }}>
                            <li>Minimal 8 karakter</li>
                            <li>Mengandung minimal satu huruf</li>
                            <li>Mengandung minimal satu angka</li>
                            <li>Mengandung minimal satu karakter khusus</li>
                        </ul>
                    </div>

                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            loading={loading} 
                            block 
                            size="large"
                            style={{ marginBottom: '1rem' }}
                        >
                            Reset Password
                        </Button>
                    </Form.Item>
                </Form>

                <div style={{ textAlign: 'center' }}>
                    <Link 
                        href="/auth/login"
                        style={{ color: '#3b82f6', textDecoration: 'none' }}
                    >
                        ← Kembali ke Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
