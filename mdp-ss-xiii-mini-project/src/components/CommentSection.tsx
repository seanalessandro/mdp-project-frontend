"use client";

import { useState } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import * as api from '@/lib/api';
import { Avatar, Button, Form, Input, List, Spin, message, Space, Tooltip } from 'antd';
import { useAuth } from '@/context/AuthContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

// Aktifkan plugin agar bisa menggunakan .fromNow()
dayjs.extend(relativeTime);

const CustomComment = ({ actions, author, avatar, content, datetime, children }: any) => {
    return (
        <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
            <div>{avatar}</div>
            <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: 500, color: '#4a4a4a' }}>{author}</span>
                    {datetime && (
                        <Tooltip title={dayjs(datetime).format('dddd, MMMM D, YYYY h:mm A')}>
                            <span style={{ fontSize: '12px', color: '#aaa' }}>{dayjs(datetime).fromNow()}</span>
                        </Tooltip>
                    )}
                </div>
                <div style={{ marginTop: '4px' }}>{content}</div>
                <div style={{ marginTop: '8px', display: 'flex', gap: '12px' }}>{actions}</div>
                {children && <div style={{ marginTop: '12px' }}>{children}</div>}
            </div>
        </div>
    );
};

const CommentThread = ({ comment, docId }: { comment: any, docId: string }) => {
    const [replyVisible, setReplyVisible] = useState(false);
    const [repliesExpanded, setRepliesExpanded] = useState(false);
    const [form] = Form.useForm();
    const { mutate } = useSWRConfig();
    const { user } = useAuth();

    const handleReplySubmit = async (values: { content: string }) => {
        try {
            await api.createReply(comment._id, values.content);
            message.success('Reply sent!');
            form.resetFields();
            setReplyVisible(false);
            mutate(`/documents/${docId}/comments`);
        } catch (error) {
            message.error('Failed to send reply.');
        }
    };

    const ReplyForm = (
        <Form form={form} onFinish={handleReplySubmit} style={{ marginLeft: 48, marginTop: 12 }}>
            <Form.Item name="content" rules={[{ required: true, message: 'Reply cannot be empty' }]}>
                <Input.TextArea rows={2} placeholder={`Replying to ${comment.author?.username || 'user'}...`} />
            </Form.Item>
            <Form.Item>
                <Button htmlType="submit" size="small" type="primary">Post Reply</Button>
            </Form.Item>
        </Form>
    );

    const hasReplies = comment.replies && comment.replies.length > 0;
    const authorDisplayName = comment.author?.username || (comment.authorId ? `User...${comment.authorId.slice(-4)}` : 'Unknown User');

    return (
        <CustomComment
            actions={[<span key="reply-to" onClick={() => setReplyVisible(!replyVisible)} style={{ cursor: 'pointer', color: '#1677ff', fontSize: '12px' }}>Reply</span>]}
            author={<a>{authorDisplayName}</a>}
            avatar={<Avatar>{comment.author?.username?.[0].toUpperCase() || 'U'}</Avatar>}
            content={<p>{comment.content}</p>}
            datetime={comment.createdOn}
        >
            {hasReplies && !repliesExpanded && (
                <Button type="link" onClick={() => setRepliesExpanded(true)} style={{ padding: 0, fontSize: '12px' }}>
                    View {comment.replies.length} {comment.replies.length > 1 ? 'replies' : 'reply'}
                </Button>
            )}

            {hasReplies && repliesExpanded && (
                <>
                    {comment.replies.map((reply: any) => {
                        const replyAuthorDisplayName = reply.author?.username || (reply.authorId ? `User...${reply.authorId.slice(-4)}` : 'Unknown User');

                        return (
                            <CustomComment
                                key={reply._id}
                                author={<a>{replyAuthorDisplayName}</a>}
                                avatar={<Avatar size="small">{reply.author?.username?.[0].toUpperCase() || 'U'}</Avatar>}
                                content={<p>{reply.content}</p>}
                                datetime={reply.createdAt}
                            />
                        );
                    })}
                    <Button type="link" onClick={() => setRepliesExpanded(false)} style={{ padding: 0, marginTop: '8px', fontSize: '12px' }}>
                        Hide replies
                    </Button>
                </>
            )}

            {replyVisible && ReplyForm}
        </CustomComment>
    );
};

export default function CommentSection({ docId }: { docId: string }) {
    const { data: comments, error, isLoading } = useSWR(docId ? `/documents/${docId}/comments` : null, () => api.getComments(docId));
    const { mutate } = useSWRConfig();
    const [form] = Form.useForm();
    const { user } = useAuth();

    const [showAllComments, setShowAllComments] = useState(false);
    const initialCommentCount = 3;

    const handleCommentSubmit = async (values: { content: string }) => {
        if (!values.content || !values.content.trim()) return;
        try {
            await api.createComment(docId, { content: values.content, markedText: 'general' });
            message.success('Comment posted!');
            form.resetFields();
            mutate(`/documents/${docId}/comments`);
        } catch (error) {
            message.error('Failed to post comment.');
        }
    };

    if (isLoading) return <Spin />;
    if (error) return <div>Failed to load comments.</div>;

    const displayedComments = showAllComments ? comments : comments?.slice(0, initialCommentCount);

    return (
        <div style={{ marginTop: '2rem', padding: '24px', background: '#fff', borderTop: '1px solid #f0f0f0' }}>
            <h2>Comments ({comments?.length || 0})</h2>

            <CustomComment
                avatar={<Avatar>{user?.username?.[0].toUpperCase() || 'A'}</Avatar>}
                content={
                    <Form form={form} onFinish={handleCommentSubmit}>
                        <Form.Item name="content" rules={[{ required: true, message: 'Comment cannot be empty' }]}>
                            <Input.TextArea rows={4} placeholder="Write a comment..." />
                        </Form.Item>
                        <Form.Item>
                            <Button htmlType="submit" type="primary">
                                Post Comment
                            </Button>
                        </Form.Item>
                    </Form>
                }
            />

            <List
                className="comment-list"
                itemLayout="horizontal"
                dataSource={displayedComments}
                renderItem={(item: any) => (
                    <List.Item key={item._id}>
                        <CommentThread comment={item} docId={docId} />
                    </List.Item>
                )}
            />

            {comments && comments.length > initialCommentCount && !showAllComments && (
                <Button type="link" onClick={() => setShowAllComments(true)} style={{ marginTop: '1rem' }}>
                    View all {comments.length} comments...
                </Button>
            )}

            {comments && comments.length > initialCommentCount && showAllComments && (
                <Button type="link" onClick={() => setShowAllComments(false)} style={{ marginTop: '1rem' }}>
                    Show less...
                </Button>
            )}
        </div>
    );
}