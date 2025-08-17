"use client";

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import * as api from '@/lib/api';
import { Spin } from 'antd';
import dynamic from 'next/dynamic';

// Muat komponen PreviewClient secara dinamis dan nonaktifkan SSR
const PreviewClient = dynamic(() => import('@/components/PreviewClient'), {
    ssr: false, // <-- Kunci utama: Nonaktifkan Server-Side Rendering
    loading: () => (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Spin size="large" />
        </div>
    ),
});

export default function DocumentPreviewPage() {
    const params = useParams();
    const docId = params.id as string;

    const { data: document, error, isLoading } = useSWR(
        docId ? `/documents/${docId}` : null,
        () => api.getDocument(docId)
    );

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return <div>Gagal memuat dokumen.</div>;
    }

    // Kirim data yang sudah di-fetch sebagai prop
    return <PreviewClient documentData={document} docId={docId} />;
}