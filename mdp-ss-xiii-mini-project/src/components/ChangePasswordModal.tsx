"use client";

import { useState } from "react";
import { Modal, Input, Button, Form, message } from "antd";
import { apiService } from "../utils/api";
import { validatePassword } from "../utils/auth";

interface ChangePasswordModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function ChangePasswordModal({ visible, onCancel, onSuccess }: ChangePasswordModalProps) {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { oldPassword: string; newPassword: string; confirmPassword: string }) => {
    // Validate new password
    const passwordError = validatePassword(values.newPassword);
    if (passwordError) {
      message.error(passwordError);
      return;
    }

    // Check if passwords match
    if (values.newPassword !== values.confirmPassword) {
      message.error('Password baru dan konfirmasi password tidak cocok');
      return;
    }

    setLoading(true);
    try {
      await apiService.changePassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      message.success('Password berhasil diubah! Silakan login kembali dengan password baru Anda.', 4);
      form.resetFields();
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal mengubah password';
      
      // Provide more specific error messages
      if (errorMessage.includes('password lama') || errorMessage.includes('old password') || errorMessage.includes('incorrect')) {
        message.error('Password lama yang Anda masukkan salah. Silakan coba lagi.');
      } else if (errorMessage.includes('validation') || errorMessage.includes('requirement')) {
        message.error('Password baru tidak memenuhi persyaratan. Pastikan minimal 8 karakter dengan kombinasi huruf, angka, dan karakter khusus.');
      } else if (errorMessage.includes('unauthorized') || errorMessage.includes('token')) {
        message.error('Sesi Anda telah berakhir. Silakan login kembali.');
      } else {
        message.error(`Gagal mengubah password: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Ganti Password"
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          label="Password Lama"
          name="oldPassword"
          rules={[{ required: true, message: 'Masukkan password lama Anda' }]}
        >
          <Input.Password placeholder="Masukkan password lama" />
        </Form.Item>

        <Form.Item
          label="Password Baru"
          name="newPassword"
          rules={[{ required: true, message: 'Masukkan password baru' }]}
        >
          <Input.Password placeholder="Masukkan password baru" />
        </Form.Item>

        <Form.Item
          label="Konfirmasi Password Baru"
          name="confirmPassword"
          rules={[{ required: true, message: 'Konfirmasi password baru' }]}
        >
          <Input.Password placeholder="Konfirmasi password baru" />
        </Form.Item>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
          <Button onClick={onCancel}>Batal</Button>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
          >
            Ganti Password
          </Button>
        </div>
      </Form>

      <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <p style={{ fontSize: '12px', color: '#666', fontWeight: 600, marginBottom: '4px' }}>Persyaratan password:</p>
        <ul style={{ fontSize: '12px', color: '#999', margin: 0, paddingLeft: '16px' }}>
          <li style={{ marginBottom: '4px' }}>• Minimal 8 karakter</li>
          <li style={{ marginBottom: '4px' }}>• Mengandung minimal satu huruf</li>
          <li style={{ marginBottom: '4px' }}>• Mengandung minimal satu angka</li>
          <li>• Mengandung minimal satu karakter khusus</li>
        </ul>
      </div>
    </Modal>
  );
}
