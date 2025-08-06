"use client";

import React, { useState } from "react";
import { Modal } from "antd";

interface User {
    id: number;
    username: string;
    fullName: string;
    role: string;
    roleDisplay: string;
    status: 'active' | 'inactive';
}

export default function ManageUsersPage() {
    const [users, setUsers] = useState<User[]>([
        { id: 1, username: "User APPS", fullName: "User APPS", role: "APPS", roleDisplay: "APPS/APPC", status: 'active' },
        { id: 2, username: "User APPC", fullName: "User APPC", role: "APPC", roleDisplay: "APPS/APPC", status: 'active' },
        { id: 3, username: "User Developer", fullName: "User Developer", role: "DEV", roleDisplay: "Developer", status: 'active' },
        { id: 4, username: "Dept Head", fullName: "Dept Head", role: "DH", roleDisplay: "Dept Head", status: 'active' },
    ]);

    const [formData, setFormData] = useState({
        username: "",
        fullName: "",
        role: "APPS/APPC",
        password: ""
    });

    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingUser) {
            setUsers(users.map(user =>
                user.id === editingUser.id
                    ? { ...user, username: formData.username, fullName: formData.fullName, role: formData.role, roleDisplay: formData.role }
                    : user
            ));
            setEditingUser(null);
        } else {
            const newUser: User = {
                id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
                username: formData.username,
                fullName: formData.fullName,
                role: formData.role,
                roleDisplay: formData.role,
                status: 'active'
            };
            setUsers([...users, newUser]);
        }

        setFormData({ username: "", fullName: "", role: "APPS/APPC", password: "" });
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
    };

    const handleEdit = (user: User) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            fullName: user.fullName,
            role: user.role,
            password: ""
        });
    };

    const handleDelete = (userId: number) => {
        Modal.confirm({
            title: 'Konfirmasi Hapus',
            content: 'Apakah Anda yakin ingin menghapus user ini?',
            okText: 'Ya',
            cancelText: 'Tidak',
            onOk: () => {
                setUsers(users.filter(user => user.id !== userId));
            },
        });
    };

    const handleCancel = () => {
        setEditingUser(null);
        setFormData({ username: "", fullName: "", role: "APPS/APPC", password: "" });
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.roleDisplay.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getRoleColor = (role: string) => {
        switch (role) {
            case "APPS":
            case "APPC":
            case "DEV":
                return "text-green-600";
            case "DH":
                return "text-blue-600";
            default:
                return "text-gray-600";
        }
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
                        <h1 className="text-xl font-semibold">Panel Manajemen User</h1>
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
                        {editingUser ? "User berhasil diupdate!" : "User berhasil ditambahkan!"}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">
                                {editingUser ? "Edit User" : "Tambah User Baru"}
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Username
                                    </label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Masukkan username"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nama Lengkap
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Masukkan nama lengkap"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Role
                                    </label>
                                    <select
                                        name="role"
                                        value={formData.role}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="APPS/APPC">APPS/APPC</option>
                                        <option value="Developer">Developer</option>
                                        <option value="Dept Head">Dept Head</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Masukkan password"
                                        required={!editingUser}
                                    />
                                    {editingUser && (
                                        <p className="text-xs text-gray-500 mt-1">Kosongkan jika tidak ingin mengubah password</p>
                                    )}
                                </div>

                                <div className="flex space-x-3">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition duration-200"
                                    >
                                        {editingUser ? "Update" : "Simpan"}
                                    </button>

                                    {editingUser && (
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
                                <h2 className="text-lg font-semibold text-gray-800">Daftar User</h2>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        placeholder="Cari user..."
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
                                <table className="min-w-full">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                No
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Username
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Nama Lengkap
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Role
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
                                        {filteredUsers.map((user, index) => (
                                            <tr key={user.id} className="hover:bg-gray-50">
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {index + 1}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                    {user.username}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {user.fullName}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className={`text-sm font-medium ${getRoleColor(user.role)}`}>
                                                        {user.roleDisplay}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.status === 'active'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {user.status === 'active' ? 'Aktif' : 'Tidak Aktif'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => handleEdit(user)}
                                                            className="text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded transition duration-200"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(user.id)}
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

                                {filteredUsers.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        {searchTerm ? "Tidak ada user yang ditemukan" : "Belum ada user"}
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