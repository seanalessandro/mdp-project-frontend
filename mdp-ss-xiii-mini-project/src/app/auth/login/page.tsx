"use client";

import React, { useState } from "react";
import { Form, Input, Button, Spin, message, Divider, Alert } from "antd"; // Added Alert
import { GoogleOutlined } from '@ant-design/icons';
import { useAuth } from "@/context/AuthContext";
import PaperIcon from "@/components/PaperIcon";

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>(''); // State for error message
    const { login } = useAuth();
    const [form] = Form.useForm();

    const handleLogin = async (values: { username: string; password: string }) => {
        setLoading(true);
        setErrorMessage(''); // Clear previous error
        
        try {
            // Panggil fungsi login dari context
            await login(values);

            // --- TAMBAHAN: Tampilkan pesan sukses SETELAH login berhasil ---
            message.success('Login berhasil! Mengarahkan ke dashboard...', 2);
            // Redirect akan di-handle oleh AuthContext

        } catch (error: unknown) {
            // Provide more specific error messages based on the error
            const errorMessage = error instanceof Error ? error.message : 'Login gagal';
            
            let displayMessage = '';
            
            if (errorMessage.includes('incorrect') || errorMessage.includes('wrong') || errorMessage.includes('not found')) {
                displayMessage = 'Username atau password salah';
            } else if (errorMessage.includes('invalid') && errorMessage.includes('format')) {
                displayMessage = 'Format input tidak valid';
            } else if (errorMessage.includes('inactive') || errorMessage.includes('disabled')) {
                displayMessage = 'Akun Anda tidak aktif. Hubungi administrator.';
            } else if (errorMessage.includes('required') || errorMessage.includes('empty')) {
                displayMessage = 'Username dan password harus diisi';
            } else {
                displayMessage = 'Login gagal. Periksa kembali username dan password Anda.';
            }
            
            // Set error message for display
            setErrorMessage(displayMessage);
            
            // Also show message popup
            message.destroy(); // Clear any existing messages first
            message.error({
                content: displayMessage,
                duration: 3,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        setLoading(true);
        window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3033/api'}/auth/google/login`;
    };

    return (
        <div style={{
            background: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
            padding: '2rem',
            maxWidth: '28rem',
            width: '100%'
        }}>
            <Spin spinning={loading} tip="Logging in..." size="large">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <PaperIcon style={{ width: '64px', height: '64px', color: '#3b82f6' }} />
                </div>

                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1f2937', marginBottom: '0.5rem' }}>
                        Selamat Datang Di BRIDGE
                    </h1>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                        Aplikasi Business Requirement Document
                    </p>
                </div>

                <Form form={form} onFinish={handleLogin} layout="vertical">
                    <Form.Item name="username" label="Username" rules={[{ required: true, message: 'Username tidak boleh kosong' }]}>
                        <Input 
                            placeholder="Masukkan username Anda" 
                            size="large" 
                            onChange={() => setErrorMessage('')} // Clear error when user types
                        />
                    </Form.Item>
                    <Form.Item name="password" label="Password" rules={[{ required: true, message: 'Password tidak boleh kosong' }]}>
                        <Input.Password 
                            placeholder="Masukkan password Anda" 
                            size="large" 
                            onChange={() => setErrorMessage('')} // Clear error when user types
                        />
                    </Form.Item>
                    
                    {/* Error message display */}
                    {errorMessage && (
                        <div style={{ 
                            marginBottom: '16px',
                            padding: '8px 12px',
                            backgroundColor: '#fff2f0',
                            border: '1px solid #ffccc7',
                            borderRadius: '6px',
                            color: '#cf1322',
                            fontSize: '14px',
                            textAlign: 'center'
                        }}>
                            {errorMessage}
                        </div>
                    )}
                    
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block size="large">
                            Login
                        </Button>
                    </Form.Item>
                </Form>

                <Divider>atau</Divider>

                <Button
                    block
                    icon={<GoogleOutlined />}
                    size="large"
                    onClick={handleGoogleLogin}
                    loading={loading}
                >
                    Login with Google
                </Button>
            </Spin>
        </div>
    );
}