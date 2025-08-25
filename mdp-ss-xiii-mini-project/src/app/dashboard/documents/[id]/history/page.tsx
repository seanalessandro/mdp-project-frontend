"use client";

import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import * as api from '@/lib/api';
import { Spin, Typography, Timeline, Button, Space, Card, Modal, message } from 'antd';
import { useState } from 'react';
import { DocumentVersion } from '@/lib/types';
import DiffViewer from '@/components/documents/DiffViewer'; // Import komponen baru

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
    const [diffResult, setDiffResult] = useState(null);
    const [isComparing, setIsComparing] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleCompareClick = (version: DocumentVersion) => {
        if (!fromVersion) {
            setFromVersion(version);
            message.info(`Versi ${version.version.toFixed(1)} dipilih. Pilih satu versi lagi untuk dibandingkan.`);
        } else {
            // Urutkan agar 'from' selalu versi yang lebih lama
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
            const result = await api.compareVersions(v1.id, v2.id);
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
        setIsModalVisible(false);
    };

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
                <Timeline style={{ marginTop: '24px' }}>
                    {(versions || []).map((version: DocumentVersion) => (
                        <Timeline.Item key={version.id}>
                            <p>
                                <strong>Versi {version.version.toFixed(1)}</strong> - <span style={{ color: '#888' }}>{version.changeDescription}</span>
                            </p>
                            <p style={{ fontSize: '12px', color: '#aaa' }}>
                                oleh {version.createdBy} pada {new Date(version.createdOn).toLocaleString('id-ID')}
                            </p>
                            <Button
                                size="small"
                                style={{ marginTop: '8px' }}
                                type={fromVersion?.id === version.id ? 'primary' : 'default'}
                                onClick={() => handleCompareClick(version)}
                            >
                                {fromVersion?.id === version.id ? 'Terpilih' : 'Bandingkan dari Versi Ini'}
                            </Button>
                        </Timeline.Item>
                    ))}
                </Timeline>
            </Card>

            <Modal
                title={`Membandingkan Versi ${fromVersion?.version.toFixed(1)} dengan Versi ${toVersion?.version.toFixed(1)}`}
                open={isModalVisible}
                onCancel={clearComparison}
                footer={[<Button key="back" onClick={clearComparison}>Tutup</Button>]}
                width={1000}
            >
                {isComparing ? <Spin /> : <DiffViewer diffs={diffResult} />}
            </Modal>
        </Space>
    );
}