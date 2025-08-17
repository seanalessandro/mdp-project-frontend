import { LoginRequest, RoleRequest, AdminCreateUserRequest } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3033/api';
import { CreateCommentPayload } from './types';

// --- FUNGSI INI YANG DIPERBAIKI ---
async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {
    // Jangan set Content-Type di sini secara default
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Cek tipe body request
  let body = options.body;
  if (!(body instanceof FormData)) {
    // HANYA jika bukan FormData, atur Content-Type ke JSON
    headers['Content-Type'] = 'application/json';
  }
  // Jika body ADALAH FormData, biarkan browser yang mengatur Content-Type secara otomatis
  // agar menyertakan 'boundary' yang benar.

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers, body });

  if (response.status === 204) {
    return;
  }

  // Cek jika response mungkin tidak memiliki body (misalnya dari DELETE)
  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    if (!response.ok) {
      throw new Error('An API error occurred without a JSON response');
    }
    return; // Return kosong jika tidak ada JSON
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'An API error occurred');
  }

  return data;
}

// === Auth Endpoints ===
export const loginUser = (credentials: LoginRequest) => fetchApi('/auth/login', {
  method: 'POST',
  body: JSON.stringify(credentials),
});
export const getProfile = () => fetchApi('/profile');
export const logoutUser = () => fetchApi('/logout', { method: 'POST' });

// === Role Management Endpoints ===
export const getRoles = () => fetchApi('/admin/roles');
export const createRole = (roleData: RoleRequest) => fetchApi('/admin/roles', {
  method: 'POST',
  body: JSON.stringify(roleData),
});
export const updateRole = (id: string, roleData: RoleRequest) => fetchApi(`/admin/roles/${id}`, {
  method: 'PUT',
  body: JSON.stringify(roleData),
});
export const deleteRole = (id: string) => fetchApi(`/admin/roles/${id}`, {
  method: 'DELETE',
});
export const updateRoleStatus = (id: string, isActive: boolean) => fetchApi(`/admin/roles/${id}/status`, {
  method: 'PATCH',
  body: JSON.stringify({ isActive }),
});
export const getPermissions = () => fetchApi('/admin/permissions');

// === User Management Endpoints ===
export const getUsers = () => fetchApi('/admin/users');
export const createUser = (userData: AdminCreateUserRequest) => fetchApi('/admin/users', {
  method: 'POST',
  body: JSON.stringify(userData),
});

// === Document Management Endpoints ===
export const createDocument = (title: string) => fetchApi('/documents', {
  method: 'POST',
  body: JSON.stringify({ title }),
});
export const getDocument = (id: string) => fetchApi(`/documents/${id}`);
export const updateDocument = (id: string, data: { title: string; content: string }) => fetchApi(`/documents/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data),
});
export const getMyDocuments = () => fetchApi('/documents');
export const deleteDocument = (id: string) => fetchApi(`/documents/${id}`, {
  method: 'DELETE',
});
export const updateDocumentStatus = (id: string, status: string) => fetchApi(`/documents/${id}/status`, {
  method: 'PATCH',
  body: JSON.stringify({ status }),
});

// --- FUNGSI INI JUGA DISESUAIKAN ---
export const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  return fetchApi('/upload/image', {
    method: 'POST',
    body: formData,
    // Hapus 'headers' dari sini, biarkan fetchApi yang menanganinya
  });
};


export const getComments = (docId: string) => fetchApi(`/documents/${docId}/comments`);
export const createComment = (docId: string, data: CreateCommentPayload) =>
  fetchApi(`/documents/${docId}/comments`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const createReply = (commentId: string, content: string) =>
  fetchApi(`/comments/${commentId}/replies`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });