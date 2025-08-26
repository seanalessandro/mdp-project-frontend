// app/dashboard/documents/[id]/history/page.tsx
"use client";

import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import * as api from '@/lib/api';
import { Spin, Typography, Timeline, Button, Space, Card, Modal, message } from 'antd';
import { useState, useMemo } from 'react'; // <-- Tambahkan useMemo di sini
import { DocumentVersion } from '@/lib/types';
import VersionPreview from '@/components/documents/VersionPreview';
import DiffViewer from '@/components/documents/DiffViewer';

export default function VersionHistoryPage() {
    const params = useParams();
    const router = useRouter();
    const docId = params.id as string;

    const { data: versions, error, isLoading } = useSWR(
        docId ? `/documents/${docId}/versions` : null,
        () => api.getVersionHistory(docId)
    );

    const [fromVersion, setFromVersion] = useState<DocumentVersion | null>(null);
    const [toVersion, setToVersion] = useState<DocumentVersion | null>(null);
    const [previewVersion, setPreviewVersion] = useState<DocumentVersion | null>(null);
    const [diffResult, setDiffResult] = useState(null);
    const [isComparing, setIsComparing] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handlePreviewClick = (version: DocumentVersion) => {
        setPreviewVersion(version);
        setIsModalVisible(true);
        setFromVersion(null);
        setToVersion(null);
    };

    const handleCompareClick = (version: DocumentVersion) => {
        setPreviewVersion(null);
        if (!fromVersion) {
            setFromVersion(version);
            message.info(`Versi ${version.version.toFixed(1)} dipilih. Pilih satu versi lagi untuk dibandingkan.`);
        } else if (fromVersion.id === version.id) {
            setFromVersion(null);
            message.info('Pilihan dibatalkan.');
        } else {
            const olderVersion = new Date(fromVersion.createdOn) < new Date(version.createdOn) ? fromVersion : version;
            const newerVersion = new Date(fromVersion.createdOn) < new Date(version.createdOn) ? version : fromVersion;

            setToVersion(newerVersion);
            triggerComparison(olderVersion, newerVersion);
        }
    };

    const triggerComparison = async (v1: DocumentVersion, v2: DocumentVersion) => {
        setIsComparing(true);
        setIsModalVisible(true);
        try {
            const result = await api.compareVersions(docId, v1.id, v2.id);
            setDiffResult(result);
        } catch (err: any) {
            message.error(err.message || "Gagal membandingkan versi.");
        } finally {
            setIsComparing(false);
        }
    };

    const clearComparison = () => {
        setFromVersion(null);
        setToVersion(null);
        setDiffResult(null);
        setPreviewVersion(null);
        setIsModalVisible(false);
    };

    // --- KODE BARU: BUAT ARRAY ITEM UNTUK TIMELINE ---
    const timelineItems = useMemo(() => {
        if (!versions) return [];
        return versions.map((version: DocumentVersion) => ({
            key: version.id,
            children: (
                <>
                    <p>
                        <strong>Versi {version.version.toFixed(1)}</strong> - <span style={{ color: '#888' }}>{version.changeDescription}</span>
                    </p>
                    <p style={{ fontSize: '12px', color: '#aaa' }}>
                        oleh {version.createdByUsername || 'Unknown User'} pada {new Date(version.createdOn).toLocaleString('id-ID')}
                    </p>
                    <Space size="small" style={{ marginTop: '8px' }}>
                        <Button
                            size="small"
                            onClick={() => handlePreviewClick(version)}
                        >
                            Lihat Versi Ini
                        </Button>
                        <Button
                            size="small"
                            type={fromVersion?.id === version.id ? 'primary' : 'default'}
                            onClick={() => handleCompareClick(version)}
                        >
                            {fromVersion?.id === version.id ? 'Terpilih' : 'Bandingkan dari Versi Ini'}
                        </Button>
                    </Space>
                </>
            ),
        }));
    }, [versions, fromVersion]); // Dependency array untuk useMemo
    // ----------------------------------------------------

    if (isLoading) return <div style={{ textAlign: 'center', padding: '50px' }}><Spin size="large" /></div>;
    if (error) return <div>Gagal memuat riwayat versi.</div>;

    return (
        <Space direction="vertical" size="large" style={{ display: 'flex' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography.Title level={2}>Riwayat Versi Dokumen</Typography.Title>
                <Space>
                    {fromVersion && <Button onClick={clearComparison}>Reset Pilihan</Button>}
                    <Button onClick={() => router.back()}>Kembali ke Dokumen</Button>
                </Space>
            </div>

            <Card>
                <Typography.Text type="secondary">
                    {fromVersion ? `Bandingkan dengan Versi ${fromVersion.version.toFixed(1)}...` : 'Pilih sebuah versi untuk memulai perbandingan.'}
                </Typography.Text>
                {/* GANTI KOMPONEN TIMELINE */}
                <Timeline style={{ marginTop: '24px' }} items={timelineItems} />
            </Card>

            <Modal
                title={previewVersion ? `Pratinjau Versi ${previewVersion.version.toFixed(1)}` :
                    `Membandingkan Versi ${fromVersion?.version.toFixed(1)} dengan Versi ${toVersion?.version.toFixed(1)}`}
                open={isModalVisible}
                onCancel={clearComparison}
                footer={[<Button key="back" onClick={clearComparison}>Tutup</Button>]}
                width={previewVersion ? 800 : 1200}
            >
                {isComparing ? <Spin /> : (
                    previewVersion ? (
                        <VersionPreview content={previewVersion.content} />
                    ) : (
                        diffResult ? (
                            <Space size="large" style={{ display: 'flex' }}>
                                <div style={{ flex: 1 }}>
                                    <Typography.Title level={4}>Versi Lama</Typography.Title>
                                    <VersionPreview content={(diffResult as any).fromContent} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <Typography.Title level={4}>Versi Baru</Typography.Title>
                                    <VersionPreview content={(diffResult as any).toContent} />
                                </div>
                            </Space>
                        ) : null
                    )
                )}
            </Modal>
        </Space>
    );
}