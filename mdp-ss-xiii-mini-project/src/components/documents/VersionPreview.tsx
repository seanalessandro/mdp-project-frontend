"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import React from 'react';

// Komponen ini menerima konten JSON dari sebuah versi dokumen
const VersionPreview = ({ content }: { content: string }) => {
    const editor = useEditor({
        editable: false,
        immediatelyRender: false,
        extensions: [
            StarterKit,
            Image,
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
        ],
        content: content ? JSON.parse(content) : '',
        editorProps: {
            attributes: {
                class: 'prose max-w-none focus:outline-none p-4',
            },
        },
    });

    return <div style={{ border: '1px solid #f0f0f0', borderRadius: '8px' }}><EditorContent editor={editor} /></div>;
};

export default VersionPreview;