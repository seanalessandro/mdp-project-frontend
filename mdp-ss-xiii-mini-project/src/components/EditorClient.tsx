"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Input, Spin, message, Space, Layout, Tag, Popconfirm } from 'antd';
import { useRouter } from 'next/navigation';
import { useSWRConfig } from 'swr';
import * as api from '@/lib/api';
import { Editor } from '@tiptap/core';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
// 1. Impor kembali CommentSection
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
    const [isSaving, setIsSaving] = useState(false);
    const [currentEditor, setCurrentEditor] = useState<Editor | null>(null);

    type SaveStatus = "Unsaved changes" | "Saving..." | "Saved";
    const [saveStatus, setSaveStatus] = useState<SaveStatus>("Saved");

    useEffect(() => {
        if (documentData) {
            setTitle(documentData.title);
            setEditorContent(documentData.content);
            setStatus(documentData.status || "Draft");
        }
    }, [documentData]);

    const saveDocument = useCallback(async (currentTitle: string, currentContent: string) => {
        setSaveStatus("Saving...");
        try {
            await api.updateDocument(docId, { title: currentTitle, content: currentContent });
            setSaveStatus("Saved");
            globalMutate('/documents');
        } catch (err) {
            console.error("Auto-save failed:", err);
            setSaveStatus("Unsaved changes");
            message.error("Failed to save changes.");
        }
    }, [docId, globalMutate]);

    const debouncedSave = useMemo(
        () => debounce((newTitle: string, newContent: string) => {
            saveDocument(newTitle, newContent);
        }, 2000),
        [saveDocument]
    );

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSaveStatus("Unsaved changes");
        const newTitle = e.target.value;
        setTitle(newTitle);
        if (currentEditor) {
            debouncedSave(newTitle, editorContent);
        }
    };

    const handleContentUpdate = (editor: Editor) => {
        setSaveStatus("Unsaved changes");
        const contentAsJson = JSON.stringify(editor.getJSON());
        setEditorContent(contentAsJson);
        debouncedSave(title, contentAsJson);
    };

    const handleManualSave = () => {
        setIsSaving(true);
        debouncedSave.cancel();
        saveDocument(title, editorContent)
            .finally(() => setIsSaving(false));
    };

    const handleSetStatus = async (newStatus: string) => {
        handleManualSave();
        try {
            await api.updateDocumentStatus(docId, newStatus);
            setStatus(newStatus);
            message.success(`Document marked as "${newStatus}"`);
            globalMutate(`/documents/${docId}`);
        } catch (err) {
            message.error("Failed to update status.");
        }
    };

    return (
        <div style={{ margin: -24, background: 'transparent' }}>
            <Content>
                <div
                    className="tiptap-editor-container"
                    style={{
                        position: 'relative',
                        height: 'auto',
                        minHeight: 'calc(100vh - 350px)'
                    }}
                >
                    <SimpleEditor
                        content={editorContent}
                        onUpdate={handleContentUpdate}
                        headerContent={
                            // 2. Perbaiki styling header agar tidak berantakan
                            <div
                                className="editor-header"
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '8px 24px',
                                    borderBottom: '1px solid #f0f0f0'
                                }}
                            >
                                <Input
                                    value={title}
                                    onChange={handleTitleChange}
                                    placeholder="Judul Dokumen" size="large" variant="borderless"
                                    style={{ maxWidth: '400px', fontWeight: 500 }}
                                />
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

                {/* 3. Panggil kembali CommentSection di bawah editor */}
                <CommentSection docId={docId} />

            </Content>
        </div>
    );
}