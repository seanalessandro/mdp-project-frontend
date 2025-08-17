"use client";

import React, { useState, useMemo } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import * as api from '@/lib/api';
import { Avatar, Button, Form, Input, List, Spin, message, Space, Tooltip } from 'antd';
import { useAuth } from '@/context/AuthContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const buildCommentTree = (comments: any[]): any[] => {
    if (!comments || comments.length === 0) return [];

    const commentMap = new Map();
    const tree: any[] = [];

    comments.forEach(comment => {
        commentMap.set(comment._id, { ...comment, children: [] });
    });

    for (const comment of commentMap.values()) {
        if (comment.parentId && commentMap.has(comment.parentId)) {
            const parent = commentMap.get(comment.parentId);
            parent.children.push(comment);
        } else {
            tree.push(comment);
        }
    }

    return tree;
};

const CustomComment = ({ actions, author, avatar, content, datetime, children }: any) => {
    return (
        <div style={{ display: 'flex', gap: '16px', width: '100%', marginTop: '16px' }}>
            <div>{avatar}</div>
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 500 }}>{author}</span>
                    {datetime && (
                        <Tooltip title={dayjs(datetime).format('dddd, MMMM D, YYYY h:mm A')}>
                            <span style={{ fontSize: '12px', color: '#aaa' }}>{dayjs(datetime).fromNow()}</span>
                        </Tooltip>
                    )}
                </div>
                <div style={{ margin: '4px 0' }}>{content}</div>
                <div style={{ marginTop: '8px', display: 'flex', gap: '12px' }}>{actions}</div>
                {children && <div style={{ marginTop: '12px' }}>{children}</div>}
            </div>
        </div>
    );
};

const CommentNode = ({ comment, docId }: { comment: any; docId: string }) => {
    const [replyVisible, setReplyVisible] = useState(false);
    const [repliesExpanded, setRepliesExpanded] = useState(false);
    const [form] = Form.useForm();
    const { mutate } = useSWRConfig();

    const handleReplySubmit = async (values: { content: string }) => {
        try {
            await api.createComment(docId, { content: values.content, parentId: comment._id });
            message.success('Reply sent!');
            form.resetFields();
            setReplyVisible(false);
            mutate(`/documents/${docId}/comments`);
        } catch (error) {
            message.error('Failed to send reply.');
        }
    };

    const authorDisplayName = comment.author?.username || 'Unknown User';

    const ReplyForm = (
        <Form form={form} onFinish={handleReplySubmit} style={{ marginTop: 12 }}>
            <Form.Item name="content" rules={[{ required: true, message: 'Reply cannot be empty' }]}>
                <Input.TextArea rows={2} placeholder={`Replying to ${authorDisplayName}...`} />
            </Form.Item>
            <Form.Item>
                <Button htmlType="submit" size="medium" type="primary">Post Reply</Button>
            </Form.Item>
        </Form>
    );

    const hasReplies = comment.children && comment.children.length > 0;

    return (
        <CustomComment
            author={<a>{authorDisplayName}</a>}
            avatar={<Avatar>{authorDisplayName[0].toUpperCase()}</Avatar>}
            content={<p>{comment.content}</p>}
            datetime={dayjs(comment.createdOn)}
            actions={[<Button type="link" size="small" style={{ padding: 0 }} key="reply" onClick={() => setReplyVisible(!replyVisible)}>Reply</Button>]}
        >
            {replyVisible && ReplyForm}

            {hasReplies && !repliesExpanded && (
                <Button type="link" onClick={() => setRepliesExpanded(true)} style={{ padding: 0, fontSize: '12px' }}>
                    View {comment.children.length} {comment.children.length > 1 ? 'replies' : 'reply'}
                </Button>
            )}

            {hasReplies && repliesExpanded && (
                <div style={{ marginTop: '16px', borderLeft: '2px solid #f0f0f0', paddingLeft: '24px' }}>
                    {comment.children.map((child: any) => (
                        <CommentNode key={child._id} comment={child} docId={docId} />
                    ))}
                    <Button type="link" onClick={() => setRepliesExpanded(false)} style={{ padding: 0, marginTop: '8px', fontSize: '12px' }}>
                        Hide replies
                    </Button>
                </div>
            )}
        </CustomComment>
    );
};

export default function CommentSection({ docId }: { docId: string }) {
    const { data: flatComments, error, isLoading } = useSWR(docId ? `/documents/${docId}/comments` : null, () => api.getComments(docId));
    const { mutate } = useSWRConfig();
    const [form] = Form.useForm();
    const { user } = useAuth();

    const [showAllComments, setShowAllComments] = useState(false);
    const initialCommentCount = 2;

    const commentTree = useMemo(() => buildCommentTree(flatComments), [flatComments]);

    const handleCommentSubmit = async (values: { content: string }) => {
        if (!values.content || !values.content.trim()) return;
        try {
            await api.createComment(docId, { content: values.content, parentId: '' });
            message.success('Comment posted!');
            form.resetFields();
            mutate(`/documents/${docId}/comments`);
        } catch (error) {
            message.error('Failed to post comment.');
        }
    };

    if (isLoading) return <Spin />;
    if (error) return <div>Failed to load comments.</div>;

    const displayedCommentTree = showAllComments ? commentTree : commentTree.slice(0, initialCommentCount);

    return (
        <div style={{ marginTop: '2rem', padding: '24px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
            <h2>Comments ({commentTree.length || 0})</h2>
            <br />

            <div style={{ display: 'flex', gap: '16px', width: '100%', marginBottom: '24px', borderBottom: '1px solid #f0f0f0', paddingBottom: '24px' }}>
                <div><Avatar>{user?.username?.[0].toUpperCase() || 'A'}</Avatar></div>
                <div style={{ flex: 1 }}>
                    <Form form={form} onFinish={handleCommentSubmit}>
                        <Form.Item name="content" rules={[{ required: true, message: 'Comment cannot be empty' }]}>
                            <Input.TextArea rows={4} placeholder="Write a comment..." />
                        </Form.Item>
                        <Form.Item>
                            <Button size='large'  htmlType="submit" type="primary">Post Comment</Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>

            <Space direction="vertical" style={{ width: '100%' }}>
                {displayedCommentTree.map((comment: any) => (
                    <CommentNode key={comment._id} comment={comment} docId={docId} />
                ))}
            </Space>

            {commentTree.length > initialCommentCount && !showAllComments && (
                <Button type="link" onClick={() => setShowAllComments(true)} style={{ marginTop: '1rem' }}>
                    View all {commentTree.length} comments...
                </Button>
            )}

            {showAllComments && (
                <Button type="link" onClick={() => setShowAllComments(false)} style={{ marginTop: '1rem' }}>
                    Show less comments...
                </Button>
            )}
        </div>
    );
}