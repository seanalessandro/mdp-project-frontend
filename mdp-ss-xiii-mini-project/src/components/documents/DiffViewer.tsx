"use client";

import React from 'react';

// Tipe data untuk hasil diff dari backend Go
type Diff = [number, string]; // [0, "sama"], [-1, "hapus"], [1, "tambah"]

const DiffViewer = ({ diffs }: { diffs: Diff[] | null }) => {
    if (!diffs) return null;

    return (
        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.5' }}>
            {diffs.map((part, index) => {
                const type = part[0];
                const text = part[1];
                let style: React.CSSProperties = {};

                if (type === 1) { // Tambah
                    style.backgroundColor = 'rgba(223, 255, 223, 1)';
                    style.color = '#22863a';
                } else if (type === -1) { // Hapus
                    style.backgroundColor = 'rgba(255, 223, 223, 1)';
                    style.color = '#cb2431';
                    style.textDecoration = 'line-through';
                }

                return (
                    <span key={index} style={style}>
                        {text}
                    </span>
                );
            })}
        </pre>
    );
};

export default DiffViewer;