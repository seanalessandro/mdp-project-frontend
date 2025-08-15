"use client";

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { EditorState } from 'lexical';

// Import Node dan Plugin baru
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { CodeHighlightNode, CodeNode } from '@lexical/code';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';

import ToolbarPlugin from './ToolbarPlugin';

// Konfigurasi tema untuk mencocokkan editor.css
const editorTheme = {
    paragraph: 'editor-paragraph',
    h1: 'editor-h1',
    h2: 'editor-h2',
    quote: 'editor-quote',
    list: {
        ol: 'editor-list-ol',
        ul: 'editor-list-ul',
        listitem: 'editor-listitem',
    },
    // ... tambahkan kelas lain jika perlu
};

const editorConfig = {
    namespace: 'MyEditor',
    theme: editorTheme,
    onError(error: Error) {
        throw error;
    },
    // Daftarkan semua Node yang akan kita gunakan
    nodes: [
        HeadingNode,
        QuoteNode,
        ListNode,
        ListItemNode,
        CodeNode,
        CodeHighlightNode,
        LinkNode,
        AutoLinkNode,
    ] as Array<any>,
};

interface LexicalEditorProps {
    initialContent?: string;
    onChange: (editorState: EditorState) => void;
}

export default function LexicalEditor({ initialContent, onChange }: LexicalEditorProps) {
    const initialConfig = {
        ...editorConfig,
        editorState: initialContent,
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>
            <div style={{ position: 'relative', background: 'white', border: '1px solid #ddd', borderRadius: '4px' }}>
                <ToolbarPlugin />
                <div style={{ position: 'relative' }}>
                    <RichTextPlugin
                        contentEditable={<ContentEditable className="editor-input" />}
                        placeholder={<div className="editor-placeholder">Mulai menulis...</div>}
                        ErrorBoundary={LexicalErrorBoundary}
                    />
                </div>
                <HistoryPlugin />
                <AutoFocusPlugin />
                <OnChangePlugin onChange={onChange} />
                <ListPlugin />
                <LinkPlugin />
            </div>
        </LexicalComposer>
    );
}