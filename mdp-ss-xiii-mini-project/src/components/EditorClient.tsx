"use client";

import { useState, useEffect } from 'react';
import { Button, Input, Spin, message, Space, Layout, Modal, Form, Popover } from 'antd';
import { useRouter } from 'next/navigation';
import useSWR, { useSWRConfig } from 'swr';
import * as api from '@/lib/api';
import { Editor } from '@tiptap/core';
import { CommentOutlined } from '@ant-design/icons';
import { SimpleEditor } from '@/components/tiptap-templates/simple/simple-editor';

const { Sider, Content } = Layout;

const CommentSidebar = ({ docId, activeCommentId, setActiveCommentId }: { docId: string, activeCommentId: string | null, setActiveCommentId: (id: string | null) => void }) => {
    const { data: comments, error, isLoading } = useSWR(docId ? `/documents/${docId}/comments` : null, () => api.getComments(docId));

    if (isLoading) return <Spin />;
    if (error) return <div style={{ color: 'red' }}>Gagal memuat komentar.</div>;

    return (
        <div>
            <h3 style={{ paddingBottom: '1rem', borderBottom: '1px solid #d9d9d9', marginBottom: '1rem' }}>Comments ({comments?.length || 0})</h3>
            {comments && comments.length > 0 ? (
                <Space direction="vertical" style={{ width: '100%' }}>
                    {comments.map((comment: any) => (
                        <div
                            key={comment.id}
                            onClick={() => setActiveCommentId(comment.id === activeCommentId ? null : comment.id)}
                            style={{
                                border: '1px solid #f0f0f0',
                                borderRadius: '8px',
                                padding: '12px',
                                cursor: 'pointer',
                                backgroundColor: activeCommentId === comment.id ? '#e6f7ff' : 'transparent',
                                transition: 'background-color 0.3s',
                            }}
                        >
                            <p style={{ fontWeight: 500, borderBottom: '1px solid #f0f0f0', paddingBottom: '8px', marginBottom: '8px' }}>"{comment.markedText}"</p>
                            <p style={{ margin: 0 }}>{comment.content}</p>
                            <small style={{ color: '#aaa', display: 'block', marginTop: '10px', textAlign: 'right' }}>by UserID: ...{comment.authorId.slice(-4)}</small>
                        </div>
                    ))}
                </Space>
            ) : (
                <p style={{ color: '#888' }}>Belum ada komentar di dokumen ini.</p>
            )}
        </div>
    );
};

export default function EditorClient({ documentData, docId }: { documentData: any, docId: string }) {
    const router = useRouter();
    const { mutate: globalMutate } = useSWRConfig();

    const [title, setTitle] = useState('');
    const [editorContent, setEditorContent] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [currentEditor, setCurrentEditor] = useState<Editor | null>(null);
    const [commentModalVisible, setCommentModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [popover, setPopover] = useState({ open: false, top: 0, left: 0 });
    const [activeCommentId, setActiveCommentId] = useState<string | null>(null);

    useEffect(() => {
        if (documentData) {
            setTitle(documentData.title);
            setEditorContent(documentData.content);
        }
    }, [documentData]);

    useEffect(() => {
        if (!currentEditor) return;

        const handleSelectionUpdate = () => {
            const { selection } = currentEditor.state;
            if (selection.empty || currentEditor.isActive('comment')) {
                setPopover(prev => ({ ...prev, open: false }));
                return;
            }
            const { from, to } = selection;
            const start = currentEditor.view.coordsAtPos(from);
            const end = currentEditor.view.coordsAtPos(to);
            const left = Math.max((start.left + end.left) / 2, start.left + 3);
            const top = start.bottom + window.scrollY;
            setPopover({ open: true, top, left });
        };

        const handleTransaction = () => { setActiveCommentId(null); };

        currentEditor.on('selectionUpdate', handleSelectionUpdate);
        currentEditor.on('transaction', handleTransaction);
        currentEditor.on('blur', () => setPopover(prev => ({ ...prev, open: false })));

        return () => {
            currentEditor.off('selectionUpdate', handleSelectionUpdate);
            currentEditor.off('transaction', handleTransaction);
            currentEditor.off('blur');
        };
    }, [currentEditor]);

    useEffect(() => {
        document.querySelectorAll('.comment-active').forEach((el: Element) => el.classList.remove('comment-active'));
        if (activeCommentId) {
            const activeSpan = document.querySelector(`span[data-comment-id="${activeCommentId}"]`);
            if (activeSpan) {
                activeSpan.classList.add('comment-active');
                activeSpan.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [activeCommentId]);

    const handleSave = async () => { /* ... (Tidak berubah) */ };
    const handleAddComment = () => {
        if (!currentEditor || currentEditor.state.selection.empty) return;
        const { from, to } = currentEditor.state.selection;
        const markedText = currentEditor.state.doc.textBetween(from, to);
        form.setFieldsValue({ markedText });
        setCommentModalVisible(true);
        setPopover({ open: false, top: 0, left: 0 });
    };
    const onCommentSubmit = async (values: { content: string, markedText: string }) => {
        if (!currentEditor) return;
        try {
            const newComment = await api.createComment(docId, values);
            const { from, to } = currentEditor.state.selection;
            currentEditor.chain().focus().setTextSelection({ from, to }).setComment(newComment.id).run();
            setCommentModalVisible(false);
            form.resetFields();
            message.success("Komentar ditambahkan!");
            globalMutate(`/documents/${docId}/comments`);
        } catch (error) {
            message.error("Gagal menambahkan komentar");
        }
    };

    return (
        <Layout style={{ margin: -24, background: 'transparent', height: 'calc(100vh - 112px)' }}>
            <Content>
                <div className="tiptap-editor-container" style={{ position: 'relative', height: '100%' }}>
                    <Popover
                        open={popover.open}
                        content={<Button onClick={handleAddComment} icon={<CommentOutlined />} size="small">Comment</Button>}
                        trigger="click"
                    >
                        <div style={{ position: 'fixed', top: `${popover.top}px`, left: `${popover.left}px` }} />
                    </Popover>
                    <SimpleEditor
                        content={editorContent}
                        onUpdate={(editor: Editor) => {
                            setEditorContent(JSON.stringify(editor.getJSON()));
                            if (!currentEditor) setCurrentEditor(editor);
                        }}
                        headerContent={
                            <div className="editor-header">
                                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul Dokumen" size="large" variant="borderless" style={{ maxWidth: '400px', fontWeight: 500 }} />
                                <Space>
                                    <Button onClick={() => router.push('/dashboard/documents')}>Kembali</Button>
                                    <Button type="primary" onClick={handleSave} loading={isSaving}>Simpan Dokumen</Button>
                                </Space>
                            </div>
                        }
                    />
                </div>
            </Content>
            <Sider width={320} style={{ background: '#fff', padding: '16px', borderLeft: '1px solid #f0f0f0', overflowY: 'auto' }}>
                <CommentSidebar docId={docId} activeCommentId={activeCommentId} setActiveCommentId={setActiveCommentId} />
            </Sider>
            <Modal title="Add a new comment" open={commentModalVisible} onCancel={() => setCommentModalVisible(false)} onOk={() => form.submit()} okText="Submit" destroyOnClose>
                <Form form={form} onFinish={onCommentSubmit} layout="vertical">
                    <p>Text to comment on: <strong>"{form.getFieldValue('markedText')}"</strong></p>
                    <Form.Item name="markedText" hidden><Input /></Form.Item>
                    <Form.Item name="content" label="Your Comment" rules={[{ required: true, message: 'Comment cannot be empty' }]}>
                        <Input.TextArea rows={4} placeholder="Type your comment here..." />
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
}