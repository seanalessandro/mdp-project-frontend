"use client";
import './Tiptap.css'; // <-- TAMBAHKAN BARIS INI
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Spin } from 'antd';
import React from 'react';
import TiptapToolbar from './TiptapToolbar';

interface TiptapEditorProps {
    content: string;
    onChange: (newContent: string) => void;
}

const TiptapEditor: React.FC<TiptapEditorProps> = ({ content, onChange }) => {
    const editor = useEditor({
        immediatelyRender: false,

        extensions: [
            StarterKit.configure({
                // Konfigurasi bisa ditambahkan di sini
            }),
        ],
        // --- PERBAIKAN DI SINI ---
        // Cek apakah 'content' ada sebelum di-parse
        content: content ? JSON.parse(content) : '',
        // -------------------------
        editorProps: {
            attributes: {
                class: 'prose max-w-none focus:outline-none p-4', // max-w-none untuk mengisi kontainer
            },
        },
        onUpdate: ({ editor }) => {
            onChange(JSON.stringify(editor.getJSON()));
        },
    });

    if (!editor) {
        return <div className="border rounded-md p-4 min-h-[300px] flex items-center justify-center"><Spin /></div>;
    }

    return (
        <div className="border rounded-md">
            <TiptapToolbar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    );
};

export default TiptapEditor;