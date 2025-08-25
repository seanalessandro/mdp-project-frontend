"use client";

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Input, Spin, message, Space, Layout, Tag, Popconfirm, Select, Dropdown } from 'antd'; // Added Dropdown
import { DownloadOutlined, EyeOutlined, FilePdfOutlined } from '@ant-design/icons'; // Added icons
import { useRouter } from 'next/navigation';
import { useSWRConfig } from 'swr';
import * as api from '@/lib/api';
import { Editor } from '@tiptap/core';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';
import CommentSection from './CommentSection';
import debounce from 'lodash.debounce';
import '@/app/dashboard/documents/[id]/editor-scoped.css';

const { Option } = Select;
const { Content } = Layout;

export default function EditorClient({ documentData, docId }: { documentData: any, docId: string }) {
    const router = useRouter();
    const { mutate: globalMutate } = useSWRConfig();

    const [title, setTitle] = useState('');
    const [editorContent, setEditorContent] = useState('');
    const [status, setStatus] = useState("Draft");
    const [docNo, setDocNo] = useState('');
    const [priority, setPriority] = useState('Medium'); // State baru untuk prioritas
    const [isSaving, setIsSaving] = useState(false);
    const [currentEditor, setCurrentEditor] = useState<Editor | null>(null);
    type SaveStatus = "Unsaved changes" | "Saving..." | "Saved";
    const [saveStatus, setSaveStatus] = useState<SaveStatus>("Saved");

    useEffect(() => {
        if (documentData) {
            setTitle(documentData.title);
            setEditorContent(documentData.content);
            setStatus(documentData.status || "Draft");
            setDocNo(documentData.docNo || '');
            setPriority(documentData.priority || 'Medium'); // Isi state prioritas
        }
    }, [documentData]);

    const saveDocument = useCallback(async (dataToSave: { docNo: string, title: string, content: string, priority: string }) => {
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
        () => debounce((data: { docNo: string, title: string, content: string, priority: string }) => {
            saveDocument(data);
        }, 2000),
        [saveDocument]
    );

    const handleValueChange = () => {
        setSaveStatus("Unsaved changes");
        // Gunakan setTimeout untuk memastikan state (title, docNo, priority) sudah terupdate sebelum save
        setTimeout(() => {
            // Kita ambil nilai terbaru dari state setelah update
            // Ini cara aman karena setState bersifat async
            const currentState = {
                docNo: (document.getElementById('docNo-input') as HTMLInputElement).value,
                title: (document.getElementById('title-input') as HTMLInputElement).value,
                content: editorContent,
                priority: priority, // `priority` sudah diupdate oleh onPriorityChange
            };
            debouncedSave(currentState);
        }, 0);
    };

    const handlePriorityChange = (newPriority: string) => {
        setPriority(newPriority);
        setSaveStatus("Unsaved changes");
        debouncedSave({ docNo, title, content: editorContent, priority: newPriority });
    };

    const handleContentUpdate = (editor: Editor) => {
        const contentAsJson = JSON.stringify(editor.getJSON());
        setEditorContent(contentAsJson);
        setSaveStatus("Unsaved changes");
        debouncedSave({ docNo, title, content: contentAsJson, priority });
    };

    const handleManualSave = () => {
        setIsSaving(true);
        debouncedSave.cancel();
        saveDocument({ docNo, title, content: editorContent, priority })
            .finally(() => setIsSaving(false));
    };

    const handleSetStatus = async (newStatus: string) => {
        // Simpan dulu semua perubahan yang belum tersimpan
        handleManualSave();
        try {
            // Panggil API untuk update status
            await api.updateDocumentStatus(docId, newStatus);
            // Update state lokal agar UI langsung berubah
            setStatus(newStatus);
            message.success(`Document marked as "${newStatus}"`);
            // Memicu refresh data di halaman detail dan daftar
            globalMutate(`/documents/${docId}`);
        } catch (error) {
            message.error("Failed to update status.");
        }
    };

    // PDF Export Functions - FR-5.3.4
    const handlePDFExport = async () => {
        try {
            message.loading('Generating PDF...', 0);
            
            const token = localStorage.getItem('token');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/${docId}/export/pdf`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to export PDF');
            }

            // Get the PDF blob
            const blob = await response.blob();
            
            // Create download link
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            
            // Generate filename with timestamp
            const timestamp = new Date().toISOString().slice(0, 10);
            const sanitizedTitle = title.replace(/[^\w\s-]/g, '').slice(0, 50);
            link.download = `${sanitizedTitle}_${timestamp}.pdf`;
            
            // Trigger download
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            message.destroy();
            message.success('PDF downloaded successfully!');
        } catch (error) {
            message.destroy();
            message.error('Failed to export PDF. Please try again.');
            console.error('PDF Export Error:', error);
        }
    };

    const handlePDFPreview = async () => {
        try {
            message.loading('Opening PDF preview...', 1);
            
            // Simply open the preview URL in a new tab
            // The backend authentication middleware will handle the token validation
            const previewUrl = `${process.env.NEXT_PUBLIC_API_URL}/documents/${docId}/preview/pdf`;
            
            // Create a temporary anchor to open the URL with Authorization header
            const token = localStorage.getItem('token');
            const a = document.createElement('a');
            a.href = previewUrl;
            a.target = '_blank';
            a.style.display = 'none';
            
            // We'll use fetch to get the PDF and create an object URL
            const response = await fetch(previewUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to load PDF preview');
            }

            const blob = await response.blob();
            const blobUrl = URL.createObjectURL(blob);
            
            window.open(blobUrl, '_blank');
            
            // Clean up the blob URL after a delay to allow the window to load
            setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
            
        } catch (error) {
            message.error('Failed to open PDF preview. Please try again.');
            console.error('PDF Preview Error:', error);
        }
    };
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
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                    padding: '8px 24px', borderBottom: '1px solid #f0f0f0', gap: '16px'
                                }}
                            >
                                <Space direction="vertical" style={{ gap: 0, flexGrow: 1 }}>
                                    <Input id="docNo-input" value={docNo} onChange={e => { setDocNo(e.target.value); handleValueChange(); }} variant="borderless" style={{ padding: 0, color: '#6B7280', fontSize: '14px' }} />
                                    <Input id="title-input" value={title} onChange={e => { setTitle(e.target.value); handleValueChange(); }} variant="borderless" style={{ padding: 0, fontSize: '24px', fontWeight: 600, lineHeight: '32px' }} />
                                </Space>
                                <Space align="center">
                                    <Tag>{saveStatus}</Tag>
                                    <Tag color={status === 'Draft' ? 'default' : 'blue'}>{status}</Tag>
                                    <Select value={priority} onChange={handlePriorityChange} style={{ width: 120 }}>
                                        <Option value="High">High</Option>
                                        <Option value="Medium">Medium</Option>
                                        <Option value="Low">Low</Option>
                                    </Select>
                                    
                                    {/* PDF Export Buttons - FR-5.3.4 */}
                                    <Dropdown
                                        menu={{
                                            items: [
                                                {
                                                    key: 'preview',
                                                    label: 'Preview PDF',
                                                    icon: <EyeOutlined />,
                                                    onClick: handlePDFPreview,
                                                },
                                                {
                                                    key: 'download',
                                                    label: 'Download PDF',
                                                    icon: <DownloadOutlined />,
                                                    onClick: handlePDFExport,
                                                },
                                            ],
                                        }}
                                        placement="bottomRight"
                                    >
                                        <Button icon={<FilePdfOutlined />}>
                                            Export PDF
                                        </Button>
                                    </Dropdown>
                                    
                                    {status === 'Draft' && (
                                        <Popconfirm title="Submit for Review" onConfirm={() => handleSetStatus('In Review')} okText="Yes, Submit" cancelText="No">
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