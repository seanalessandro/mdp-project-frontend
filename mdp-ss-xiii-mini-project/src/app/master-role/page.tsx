"use client";

import React, { useState } from "react";
import { Modal } from "antd";

interface Role {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'inactive';
}

export default function ManageRolesPage() {
  const [roles, setRoles] = useState<Role[]>([
    { id: 1, name: "Admin", description: "Hak akses penuh ke sistem", status: 'active' },
    { id: 2, name: "Developer", description: "Mengembangkan dan memelihara aplikasi", status: 'active' },
    { id: 3, name: "Dept Head", description: "Mengelola tim dan menyetujui laporan", status: 'active' },
    { id: 4, name: "User APPS", description: "Pengguna aplikasi umum", status: 'active' },
    { id: 5, name: "User APPC", description: "Pengguna aplikasi khusus", status: 'inactive' },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      Modal.info({
        title: 'Peringatan',
        content: 'Nama peran tidak boleh kosong!',
      });
      return;
    }

    if (editingRole) {
      setRoles(roles.map(role =>
        role.id === editingRole.id
          ? { ...role, name: formData.name, description: formData.description }
          : role
      ));
      setEditingRole(null);
    } else {
      const newRole: Role = {
        id: roles.length > 0 ? Math.max(...roles.map(r => r.id)) + 1 : 1,
        name: formData.name,
        description: formData.description,
        status: 'active'
      };
      setRoles([...roles, newRole]);
    }

    setFormData({ name: "", description: "" });
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 3000);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description
    });
  };

  const handleDelete = (roleId: number) => {
    Modal.confirm({
      title: 'Konfirmasi Hapus',
      content: 'Apakah Anda yakin ingin menghapus peran ini?',
      okText: 'Ya',
      cancelText: 'Tidak',
      onOk: () => {
        setRoles(roles.filter(role => role.id !== roleId));
      },
    });
  };

  const handleCancel = () => {
    setEditingRole(null);
    setFormData({ name: "", description: "" });
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: 'active' | 'inactive') => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <>
      <nav className="bg-blue-600 text-white p-4 -mx-6 -mt-6 rounded-t-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.location.href = "/dashboard"}
              className="text-white hover:text-blue-200 transition duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold">Panel Manajemen Role</h1>
          </div>
          <button
            onClick={() => window.location.href = "/login"}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-sm font-medium transition duration-200"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        {showSuccessMessage && (
          <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {editingRole ? "Peran berhasil diupdate!" : "Peran berhasil ditambahkan!"}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                {editingRole ? "Edit Peran" : "Tambah Peran Baru"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Peran
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan nama peran (misal: Admin)"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Deskripsi singkat peran ini (opsional)"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition duration-200"
                  >
                    {editingRole ? "Update Peran" : "Simpan Peran"}
                  </button>

                  {editingRole && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-md font-medium transition duration-200"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Daftar Peran</h2>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Cari peran..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        No
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama Peran
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deskripsi
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRoles.map((role, index) => (
                      <tr key={role.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {role.name}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {role.description || '-'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(role.status)}`}>
                            {role.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(role)}
                              className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition duration-200"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(role.id)}
                              className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition duration-200"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {filteredRoles.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {searchTerm ? "Tidak ada peran yang ditemukan" : "Belum ada peran"}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}