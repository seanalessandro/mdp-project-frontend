"use client";
import React from 'react';
import { Editor } from '@tiptap/react';
import { Button, Divider, Space, Tooltip } from 'antd';
import {
    BoldOutlined, ItalicOutlined, StrikethroughOutlined, CodeOutlined, UnorderedListOutlined, OrderedListOutlined, BlockOutlined, UndoOutlined, RedoOutlined
} from '@ant-design/icons';

const TiptapToolbar = ({ editor }: { editor: Editor | null }) => {
    if (!editor) {
        return null;
    }

    return (
        <div className="bg-gray-100 p-2 border-b rounded-t-md">
            <Space wrap split={<Divider type="vertical" />}>
                <Space.Compact>
                    <Tooltip title="Bold"><Button icon={<BoldOutlined />} type={editor.isActive('bold') ? 'primary' : 'default'} onClick={() => editor.chain().focus().toggleBold().run()} /></Tooltip>
                    <Tooltip title="Italic"><Button icon={<ItalicOutlined />} type={editor.isActive('italic') ? 'primary' : 'default'} onClick={() => editor.chain().focus().toggleItalic().run()} /></Tooltip>
                    <Tooltip title="Strike"><Button icon={<StrikethroughOutlined />} type={editor.isActive('strike') ? 'primary' : 'default'} onClick={() => editor.chain().focus().toggleStrike().run()} /></Tooltip>
                    <Tooltip title="Code"><Button icon={<CodeOutlined />} type={editor.isActive('code') ? 'primary' : 'default'} onClick={() => editor.chain().focus().toggleCode().run()} /></Tooltip>
                </Space.Compact>
                <Space.Compact>
                    <Tooltip title="Heading 1"><Button type={editor.isActive('heading', { level: 1 }) ? 'primary' : 'default'} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</Button></Tooltip>
                    <Tooltip title="Heading 2"><Button type={editor.isActive('heading', { level: 2 }) ? 'primary' : 'default'} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Button></Tooltip>
                    <Tooltip title="Bullet List"><Button icon={<UnorderedListOutlined />} type={editor.isActive('bulletList') ? 'primary' : 'default'} onClick={() => editor.chain().focus().toggleBulletList().run()} /></Tooltip>
                    <Tooltip title="Ordered List"><Button icon={<OrderedListOutlined />} type={editor.isActive('orderedList') ? 'primary' : 'default'} onClick={() => editor.chain().focus().toggleOrderedList().run()} /></Tooltip>
                    <Tooltip title="Blockquote"><Button icon={<BlockOutlined />} type={editor.isActive('blockquote') ? 'primary' : 'default'} onClick={() => editor.chain().focus().toggleBlockquote().run()} /></Tooltip>
                </Space.Compact>
                <Space.Compact>
                    <Tooltip title="Undo"><Button icon={<UndoOutlined />} onClick={() => editor.chain().focus().undo().run()} /></Tooltip>
                    <Tooltip title="Redo"><Button icon={<RedoOutlined />} onClick={() => editor.chain().focus().redo().run()} /></Tooltip>
                </Space.Compact>
            </Space>
        </div>
    );
};

export default TiptapToolbar;