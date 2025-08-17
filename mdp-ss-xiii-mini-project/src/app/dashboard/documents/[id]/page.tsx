"use client";

import { useParams } from 'next/navigation';
import useSWR from 'swr';
import * as api from '@/lib/api';
import { Spin } from 'antd';
import dynamic from 'next/dynamic';

// Muat komponen EditorClient secara dinamis dan nonaktifkan SSR
const EditorClient = dynamic(() => import('@/components/EditorClient'), {
  ssr: false,
  loading: () => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 112px)' }}>
      <Spin size="large" />
    </div>
  ),
});

export default function DocumentEditPage() {
  const params = useParams();
  const docId = params.id as string;

  const { data: document, error, isLoading } = useSWR(
    docId ? `/documents/${docId}` : null,
    () => api.getDocument(docId)
  );

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 112px)' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <div>Gagal memuat dokumen atau dokumen tidak ditemukan.</div>;
  }

  return (
    <EditorClient documentData={document} docId={docId} />
  );
}