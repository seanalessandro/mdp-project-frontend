import React from 'react';
import '../globals.css';


export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: '#f0f2f5'
            }}
        >
            {children}
        </div>
    );
}