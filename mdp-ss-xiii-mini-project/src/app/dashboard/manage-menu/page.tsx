"use client";

import React, { useState, useEffect } from "react";
import {
  Form,
  Input,
  Button,
  Table,
  Tag,
  Typography,
  Card,
  Row,
  Col,
  Space,
  Popconfirm,
  message,
  Switch,
  Select,
  Alert
} from "antd";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import useSWR from 'swr';
import * as api from '@/lib/api';
import { MenuType } from "@/lib/types";


interface MenuFormValues {
  name: string;
  path: string;
  icon?: string;
  parentId?: string;
}

export default function ManageMenusPage() {
  const [form] = Form.useForm();
  const [editingMenu, setEditingMenu] = useState<MenuType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Mengambil daftar menu
  const { data: menus, error: menusError, mutate: mutateMenus, isLoading: isLoadingMenus } = useSWR('/admin/menus', api.getMenus);

  useEffect(() => {
    if (editingMenu) {
      // Set nilai form saat mode edit aktif
      form.setFieldsValue({
        ...editingMenu,
        // Pastikan parentId berbentuk string untuk form
        parentId: editingMenu.parentId || ""
      });
    } else {
      form.resetFields();
    }
  }, [editingMenu, form]);

  const handleCancelEdit = () => {
    setEditingMenu(null);
    form.resetFields();
  };

  const handleSubmit = async (values: MenuFormValues) => {
    try {
      if (editingMenu) {
        const updatedMenuData = {
          ...values,
          isActive: editingMenu.isActive,
          icon: values.icon || '',
          parentId: values.parentId || '',
        };
        await api.updateMenu(editingMenu.id, updatedMenuData);
        message.success("Menu berhasil diperbarui!");
      } else {
        const newMenuData = {
          ...values,
          isActive: true,
          icon: values.icon || '',
          parentId: values.parentId || '',
        };
        await api.createMenu(newMenuData);
        message.success("Menu berhasil ditambahkan!");
      }
      mutateMenus();
      handleCancelEdit();
    } catch (err: unknown) {
      if (err instanceof Error) {
        message.error(err.message);
      } else {
        message.error("Terjadi kesalahan saat menyimpan menu.");
      }
    }
  };

  const handleDelete = async (menuId: string) => {
    try {
      await api.deleteMenu(menuId);
      message.success("Menu berhasil dihapus!");
      mutateMenus();
    } catch (err: unknown) {
      if (err instanceof Error) {
        message.error(err.message);
      } else {
        message.error("Terjadi kesalahan saat menghapus menu.");
      }
    }
  };


  const handleStatusChange = async (menu: MenuType, checked: boolean) => {
    try {
      await api.updateMenuStatus(menu.id, checked);
      message.success(`Status menu ${menu.name} berhasil diubah!`);
      mutateMenus();
    } catch (err: unknown) {
      if (err instanceof Error) {
        message.error(err.message);
      } else {
        message.error("Terjadi kesalahan saat mengubah status.");
      }
      mutateMenus();
    }
  };

  const columns = [
    {
      title: 'Nama Menu',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: MenuType, b: MenuType) => a.name.localeCompare(b.name),
    },
    {
      title: 'Path',
      dataIndex: 'path',
      key: 'path',
    },
    {
      title: 'Ikon',
      dataIndex: 'icon',
      key: 'icon',
    },
    {
      title: 'Parent',
      dataIndex: 'parentId',
      key: 'parentId',
      render: (parentId?: string) => {
        // Cari nama menu parent berdasarkan parentId
        if (!parentId) return <Tag>None</Tag>;
        const parentMenu = menus?.find(m => m.id === parentId);
        return parentMenu ? <Tag color="blue">{parentMenu.name}</Tag> : <Tag>Tidak Ditemukan</Tag>;
      },
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean, record: MenuType) => (
        <Switch
          checkedChildren="Aktif"
          unCheckedChildren="Nonaktif"
          checked={isActive}
          onChange={(checked) => handleStatusChange(record, checked)}
        />
      ),
    },
    {
      title: 'Aksi',
      key: 'aksi',
      render: (_: unknown, record: MenuType) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => setEditingMenu(record)}>Edit</Button>
          <Popconfirm
            title="Hapus Menu"
            description="Apakah Anda yakin ingin menghapus menu ini?"
            onConfirm={() => handleDelete(record.id)}
            okText="Ya, Hapus"
            cancelText="Tidak"
          >
            <Button icon={<DeleteOutlined />} danger>Hapus</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (menusError) return <Alert message="Error" description="Gagal memuat data menu." type="error" showIcon />;

  const filteredMenus = menus?.filter((menu: MenuType) =>
    menu.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Space direction="vertical" size="large" style={{ display: 'flex' }}>
      <Typography.Title level={2}>Manajemen Menu</Typography.Title>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={8}>
          <Card title={editingMenu ? `Edit Menu: ${editingMenu.name}` : "Tambah Menu Baru"} bordered={false}>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item name="name" label="Nama Menu" rules={[{ required: true, message: 'Nama menu tidak boleh kosong' }]}>
                <Input placeholder="Contoh: Dashboard" />
              </Form.Item>
              <Form.Item name="path" label="Path Menu" rules={[{ required: true, message: 'Path menu tidak boleh kosong' }]}>
                <Input placeholder="Contoh: /dashboard" />
              </Form.Item>
              <Form.Item name="icon" label="Ikon Menu">
                <Input placeholder="Contoh: home-icon" />
              </Form.Item>
              <Form.Item name="parentId" label="Menu Parent">
                <Select
                  allowClear
                  placeholder="Pilih menu parent (opsional)"
                  loading={isLoadingMenus}
                >
                  {(menus || []).map((menu) => (
                    <Select.Option key={menu.id} value={menu.id}>
                      {menu.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    {editingMenu ? "Perbarui Menu" : "Simpan Menu"}
                  </Button>
                  {editingMenu && <Button onClick={handleCancelEdit}>Batal</Button>}
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="Daftar Menu" bordered={false}>
            <Space direction="vertical" size="middle" style={{ display: 'flex' }}>
              <Input.Search
                placeholder="Cari menu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Table
                columns={columns}
                dataSource={filteredMenus}
                rowKey="id"
                loading={isLoadingMenus}
                pagination={{ pageSize: 5 }}
                scroll={{ x: 'max-content' }}
              />
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
