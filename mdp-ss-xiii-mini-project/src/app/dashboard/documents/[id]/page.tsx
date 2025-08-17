"use client";

import { useState, useEffect } from 'react';
import { Button, Input, Spin, message, Space } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import * as api from '@/lib/api';
import { Editor } from '@tiptap/core';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
// 1. Impor komponen baru kita
import CommentSection from '@/components/CommentSection';
import './editor-scoped.css';

export default function DocumentEditPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.id as string;

  const { data: document, error, isLoading } = useSWR(
    docId ? `/documents/${docId}` : null,
    () => api.getDocument(docId)
  );

  const [title, setTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

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
    } catch (err: any) {
      message.error(err.message || "Gagal menyimpan dokumen");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <div>Gagal memuat dokumen atau dokumen tidak ditemukan.</div>;
  }

  return (
    // Layout utama sekarang jadi lebih simpel, hanya pembungkus biasa
    <div style={{ margin: -24 }}>
      <div className="tiptap-editor-container">
        {document && (
          <SimpleEditor
            content={editorContent}
            onUpdate={(editor: Editor) => {
              setEditorContent(JSON.stringify(editor.getJSON()));
            }}
            headerContent={
              <div className="editor-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f0f0f0', padding: '8px 24px' }}>
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

      {/* 2. Panggil CommentSection di sini, di bawah editor */}
      <CommentSection docId={docId} />
    </div>
  );
}