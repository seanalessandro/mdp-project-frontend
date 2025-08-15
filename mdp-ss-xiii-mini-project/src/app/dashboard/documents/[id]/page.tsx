"use client";

import { useState, useEffect } from 'react';
import { Button, Input, Spin, message, Space } from 'antd'; // <-- PERBAIKAN: IMPORT SPACE
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import * as api from '@/lib/api';
import LexicalEditor from '@/components/editor/LexicalEditor';
import { EditorState } from 'lexical';

export default function DocumentEditPage() {
  const params = useParams();
  const router = useRouter();
  const docId = params.id as string;

  const { data: document, error, isLoading, mutate } = useSWR(docId ? `/documents/${docId}` : null, () => api.getDocument(docId));

  const [title, setTitle] = useState('');
  const [editorStateJSON, setEditorStateJSON] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (document) {
      setTitle(document.title);
    }
  }, [document]);

  const handleSave = async () => {
    if (!editorStateJSON) {
        message.warning("Tidak ada perubahan untuk disimpan.");
        return;
    }
    setIsSaving(true);
    try {
      await api.updateDocument(docId, { title, content: editorStateJSON });
      message.success("Dokumen berhasil disimpan!");
      mutate(); // Refresh data
    } catch (err: any) {
      message.error(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 200px)' }}><Spin tip="Loading document..." size="large" /></div>;
  if (error) return <div>Gagal memuat dokumen.</div>;

  return (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul Dokumen"
          size="large"
          style={{ maxWidth: '400px' }}
        />
        <Space>
          <Button onClick={() => router.back()}>Kembali</Button>
          <Button type="primary" onClick={handleSave} loading={isSaving}>
            Simpan Dokumen
          </Button>
        </Space>
      </div>
      <LexicalEditor
        initialContent={document?.content}
        onChange={(state) => setEditorStateJSON(JSON.stringify(state.toJSON()))}
      />
    </div>
  );
}