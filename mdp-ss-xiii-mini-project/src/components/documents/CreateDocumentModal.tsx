"use client";
import { Modal, Card, Typography, Spin, Row, Col } from 'antd';
import useSWR from 'swr';
import * as api from '@/lib/api';
import { DocumentTemplate } from '@/lib/types';
import TemplatePreview from './TemplatePreview';

interface CreateDocumentModalProps {
    open: boolean;
    onCancel: () => void;
    onSelect: (templateId: string) => void;
}

export default function CreateDocumentModal({ open, onCancel, onSelect }: CreateDocumentModalProps) {
    const { data: templates, error, isLoading } = useSWR('/document-templates', api.getDocumentTemplates);

    return (
        <Modal
            title={<Typography.Title level={4}>Mulai Buat Dokumen Requirement</Typography.Title>}
            open={open}
            onCancel={onCancel}
            footer={null}
            width={800}
        >
            <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
                Silakan pilih template dokumen yang ingin dibuat
            </Typography.Text>
            {isLoading && <div style={{ textAlign: 'center' }}><Spin /></div>}
            {error && <div>Gagal memuat template.</div>}

            {/* --- BAGIAN PENTING UNTUK SCROLL --- */}
            <div style={{ display: 'flex', overflowX: 'auto', paddingBottom: '16px' }}>
                <Row gutter={[16, 16]} wrap={false}>
                    {templates?.map((template: DocumentTemplate) => (
                        <Col key={template.id}>
                            <Card
                                hoverable
                                style={{ width: 180 }}
                                cover={
                                    <div className="template-preview-wrapper" style={{ height: 220 }}>
                                        <TemplatePreview content={template.content} />
                                    </div>
                                }
                                onClick={() => onSelect(template.id)}
                                bodyStyle={{ padding: '16px', textAlign: 'center' }}
                            >
                                <Card.Meta title={template.name} />
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </Modal>
    );
}