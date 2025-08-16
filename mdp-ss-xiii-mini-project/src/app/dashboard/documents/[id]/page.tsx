"use client";

import { useState, useEffect } from 'react';
import { Button, Input, Spin, message, Space } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import useSWR, { useSWRConfig } from 'swr';
import * as api from '@/lib/api';
import { Editor } from '@tiptap/core';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import './editor-scoped.css';

export default function DocumentEditPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.id as string;
  const { mutate: globalMutate } = useSWRConfig(); // Untuk update data di halaman lain

  // Fetch data dokumen
  const { data: document, error, isLoading } = useSWR(docId ? `/documents/${docId}` : null, () => api.getDocument(docId));

  // State untuk title dan content editor
  const [title, setTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Set state saat data dari SWR berhasil didapatkan
  useEffect(() => {
    if (document) {
      setTitle(document.title);
      setEditorContent(document.content);
    }
  }, [document]);

  const handleSave = async () => {
    if (!title.trim()) {
      message.error("Judul tidak boleh kosong.");
      return;
    }
    setIsSaving(true);
    try {
      await api.updateDocument(docId, { title, content: editorContent });
      message.success("Dokumen berhasil disimpan!");
      // Update cache untuk halaman daftar dokumen agar menampilkan 'modifiedOn' yang baru
      globalMutate('/documents');
    } catch (err: any) {
      message.error(err.message || "Gagal menyimpan dokumen");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}><Spin size="large" /></div>;
  if (error) return <div>Gagal memuat dokumen atau dokumen tidak ditemukan.</div>;

  return (
    <div className="tiptap-editor-container">
      {/* Pastikan SimpleEditor hanya dirender setelah content siap */}
      {document && (
        <SimpleEditor
          content={editorContent}
          onUpdate={(editor: Editor) => {
            setEditorContent(JSON.stringify(editor.getJSON()));
          }}
          headerContent={
            <div className='editor-header' style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb' }}>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Judul Dokumen"
                size="large"
                variant="borderless"
                style={{ maxWidth: '400px', fontWeight: 500 }}
              />
              <Space>
                <Button onClick={() => router.push('/dashboard/documents')}>Kembali</Button>
                <Button type="primary" onClick={handleSave} loading={isSaving}>Simpan Dokumen</Button>
              </Space>
            </div>
          }
        />
      )}
    </div>
  );
}