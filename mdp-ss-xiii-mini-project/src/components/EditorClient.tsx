"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Input, Spin, message, Space, Layout, Tag, Popconfirm, Typography } from 'antd'; // Tambahkan Typography
import { useRouter } from 'next/navigation';
import { useSWRConfig } from 'swr';
import * as api from '@/lib/api';
import { Editor } from '@tiptap/core';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import CommentSection from './CommentSection';
import debounce from 'lodash.debounce';

import '@/app/dashboard/documents/[id]/editor-scoped.css';

const { Content } = Layout;

export default function EditorClient({ documentData, docId }: { documentData: any, docId: string }) {
    const router = useRouter();
    const { mutate: globalMutate } = useSWRConfig();

    const [title, setTitle] = useState('');
    const [editorContent, setEditorContent] = useState('');
    const [status, setStatus] = useState("Draft");
    // --- State baru untuk docNo ---
    const [docNo, setDocNo] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [currentEditor, setCurrentEditor] = useState<Editor | null>(null);
    type SaveStatus = "Unsaved changes" | "Saving..." | "Saved";
    const [saveStatus, setSaveStatus] = useState<SaveStatus>("Saved");

    useEffect(() => {
        if (documentData) {
            setTitle(documentData.title);
            setEditorContent(documentData.content);
            setStatus(documentData.status || "Draft");
            setDocNo(documentData.docNo || ''); // Isi state docNo
        }
    }, [documentData]);

    // Perbarui fungsi save untuk menyertakan docNo
    const saveDocument = useCallback(async (dataToSave: { docNo: string, title: string, content: string }) => {
        setSaveStatus("Saving...");
        try {
            await api.updateDocument(docId, dataToSave);
            setSaveStatus("Saved");
            globalMutate('/documents');
        } catch (err) {
            console.error("Auto-save failed:", err);
            setSaveStatus("Unsaved changes");
            message.error("Failed to save changes.");
        }
    }, [docId, globalMutate]);

    const debouncedSave = useMemo(
        () => debounce((data: { docNo: string, title: string, content: string }) => {
            saveDocument(data);
        }, 2000),
        [saveDocument]
    );

    const handleDocNoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSaveStatus("Unsaved changes");
        const newDocNo = e.target.value;
        setDocNo(newDocNo);
        debouncedSave({ docNo: newDocNo, title, content: editorContent });
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSaveStatus("Unsaved changes");
        const newTitle = e.target.value;
        setTitle(newTitle);
        debouncedSave({ docNo, title: newTitle, content: editorContent });
    };

    const handleContentUpdate = (editor: Editor) => {
        setSaveStatus("Unsaved changes");
        const contentAsJson = JSON.stringify(editor.getJSON());
        setEditorContent(contentAsJson);
        debouncedSave({ docNo, title, content: contentAsJson });
    };

    const handleManualSave = () => {
        setIsSaving(true);
        debouncedSave.cancel();
        saveDocument({ docNo, title, content: editorContent })
            .finally(() => setIsSaving(false));
    };

    const handleSetStatus = async (newStatus: string) => { /* ... (fungsi ini tidak berubah) ... */ };

    return (
        <div style={{ margin: -24, background: 'transparent' }}>
            <Content>
                <div className="tiptap-editor-container">
                    <SimpleEditor
                        content={editorContent}
                        onUpdate={handleContentUpdate}
                        headerContent={
                            <div
                                className="editor-header"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '8px 24px',
                                    borderBottom: '1px solid #f0f0f0',
                                    gap: '16px'
                                }}
                            >
                                {/* --- Ganti Teks Judul menjadi Input --- */}
                                <Space direction="vertical" style={{ gap: 0, flexGrow: 1 }}>
                                    <Input
                                        value={docNo}
                                        onChange={handleDocNoChange}
                                        variant="borderless"
                                        placeholder="Document ID"
                                        style={{ padding: 0, color: '#6B7280', fontSize: '14px' }}
                                    />
                                    <Input
                                        value={title}
                                        onChange={handleTitleChange}
                                        variant="borderless"
                                        placeholder="Judul Dokumen"
                                        style={{ padding: 0, fontSize: '24px', fontWeight: 600, lineHeight: '32px' }}
                                    />
                                </Space>

                                <Space align="center">
                                    <Tag>{saveStatus}</Tag>
                                    <Tag color={status === 'Draft' ? 'default' : 'blue'}>{status}</Tag>
                                    {status === 'Draft' && (
                                        <Popconfirm
                                            title="Submit for Review"
                                            description="Are you sure you want to mark this document as ready for review?"
                                            onConfirm={() => handleSetStatus('In Review')}
                                            okText="Yes, Submit"
                                            cancelText="No"
                                        >
                                            <Button>Ready for Review</Button>
                                        </Popconfirm>
                                    )}
                                    <Button onClick={() => router.push('/dashboard/documents')}>Kembali</Button>
                                    <Button type="primary" onClick={handleManualSave} loading={isSaving}>Simpan Dokumen</Button>
                                </Space>
                            </div>
                        }
                    />
                </div>
                {/* <CommentSection docId={docId} /> */}
            </Content>
        </div>
    );
}