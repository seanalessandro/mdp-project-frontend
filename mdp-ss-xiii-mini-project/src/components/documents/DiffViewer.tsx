"use client";

import React from 'react';
import { Typography } from 'antd';

// Tipe data untuk hasil diff dari backend Go: [0, "sama"], [-1, "hapus"], [1, "tambah"]
type Diff = [number, string];

const DiffViewer = ({ diffs }: { diffs: Diff[] | null }) => {
    if (!diffs) {
        return <Typography.Text type="secondary">Memuat hasil perbandingan...</Typography.Text>;
    }

    return (
        // Gunakan <pre> untuk menjaga spasi dan baris baru
        <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.5' }}>
            {diffs.map((part, index) => {
                const type = part[0];
                const text = part[1];
                let style: React.CSSProperties = {};

                // Beri warna berdasarkan tipe diff
                if (type === 1) { // Teks yang ditambahkan
                    style.backgroundColor = 'rgba(223, 255, 223, 1)';
                    style.color = '#22863a';
                } else if (type === -1) { // Teks yang dihapus
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