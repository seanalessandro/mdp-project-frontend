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
      message.error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await apiService.changePassword({
        old_password: values.oldPassword,
        new_password: values.newPassword,
      });

      message.success('Password changed successfully');
      form.resetFields();
      onSuccess();
    } catch (error) {
      message.error(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Change Password"
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
          label="Current Password"
          name="oldPassword"
          rules={[{ required: true, message: 'Please enter your current password' }]}
        >
          <Input.Password placeholder="Enter current password" />
        </Form.Item>

        <Form.Item
          label="New Password"
          name="newPassword"
          rules={[{ required: true, message: 'Please enter new password' }]}
        >
          <Input.Password placeholder="Enter new password" />
        </Form.Item>

        <Form.Item
          label="Confirm New Password"
          name="confirmPassword"
          rules={[{ required: true, message: 'Please confirm new password' }]}
        >
          <Input.Password placeholder="Confirm new password" />
        </Form.Item>

        <div className="flex justify-end space-x-2">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Change Password
          </Button>
        </div>
      </Form>

      <div className="mt-4 p-3 bg-gray-50 rounded">
        <p className="text-xs text-gray-600 font-semibold mb-1">Password requirements:</p>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>• At least 8 characters long</li>
          <li>• Contains at least one letter</li>
          <li>• Contains at least one number</li>
          <li>• Contains at least one special character</li>
        </ul>
      </div>
    </Modal>
  );
}
