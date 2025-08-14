"use client";

import React from "react";
import { Button, Card, Typography } from "antd";
import { useRouter } from 'next/navigation';

const { Title, Text } = Typography;

export default function ForgotPasswordPage() {
    const router = useRouter();

    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px'
        }}>
            <Card style={{
                maxWidth: '28rem',
                width: '100%',
                textAlign: 'center',
                padding: '2rem'
            }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ 
                        width: '64px', 
                        height: '64px', 
                        backgroundColor: '#f59e0b', 
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        color: 'white'
                    }}>
                        ℹ️
                    </div>
                </div>

                <Title level={3} style={{ marginBottom: '1rem' }}>
                    Reset Password
                </Title>
                
                <Text style={{ 
                    display: 'block', 
                    marginBottom: '1.5rem',
                    color: '#6b7280',
                    fontSize: '1rem'
                }}>
                    Jika Anda lupa password, silakan hubungi administrator sistem untuk mendapatkan bantuan reset password.
                </Text>

                <Text style={{ 
                    display: 'block', 
                    marginBottom: '2rem',
                    color: '#374151',
                    fontSize: '0.875rem',
                    fontStyle: 'italic'
                }}>
                    Jika Anda sudah login dan ingin mengubah password, gunakan menu &quot;Ganti Password&quot; di dashboard.
                </Text>

                <Button 
                    type="primary" 
                    size="large"
                    block
                    onClick={() => router.push('/auth/login')}
                    style={{ marginBottom: '1rem' }}
                >
                    Kembali ke Login
                </Button>
            </Card>
        </div>
    );
}
