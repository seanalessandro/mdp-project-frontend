// components/documents/VersionPreview.tsx

"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import { StarterKit } from "@tiptap/starter-kit";
import { Image } from "@tiptap/extension-image";
import { Table, TableCell, TableHeader, TableRow } from '@tiptap/extension-table';
import { TextAlign } from "@tiptap/extension-text-align";
import { Highlight } from "@tiptap/extension-highlight";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Selection } from "@tiptap/extensions";
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension";


// Impor semua CSS yang diperlukan
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"
import '@/styles/tiptap-base.scss';



export default function VersionPreview({ content }: { content: string }) {
    const editor = useEditor({
        editable: false, // Penting: Ini yang membuat editor hanya bisa dilihat, tidak bisa diedit
        immediatelyRender: false, // <-- Tambahkan baris ini
        extensions: [
            StarterKit,
            Image,
            Table.configure({ resizable: true }),
            TableRow,
            TableHeader,
            TableCell,
            TextAlign.configure({ types: ["heading", "paragraph"] }),
            Highlight,
            Subscript,
            Superscript,
            Selection,
            HorizontalRule,
        ],
        content: JSON.parse(content),
    });

    if (!editor) {
        return null;
    }

    return (
        <div style={{ padding: '24px', border: '1px solid #e0e0e0', borderRadius: '8px' }}>
            <EditorContent editor={editor} />
        </div>
    );
}