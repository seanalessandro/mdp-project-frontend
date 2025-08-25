"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React from 'react';

// Komponen ini menerima konten JSON dari template
const TemplatePreview = ({ content }: { content: string }) => {
    const editor = useEditor({
        // --- KUNCI UTAMA: Membuat editor tidak bisa diedit ---
        immediatelyRender: false,
        editable: false,
        // ----------------------------------------------------
        extensions: [
            StarterKit.configure(),
        ],
        content: content ? JSON.parse(content) : '',
        editorProps: {
            attributes: {
                // Hapus kelas prose agar kita bisa kontrol penuh stylenya
                class: 'focus:outline-none p-4',
            },
        },
    });

    return <EditorContent editor={editor} />;
};

export default TemplatePreview;