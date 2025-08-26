import { LoginRequest, RoleRequest } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3033/api';
import { CreateCommentPayload, CreateDocumentPayload } from './types';

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const body = options.body;
  if (!(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers, body });

  if (response.status === 204) {
    return;
  }

  const contentType = response.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    if (!response.ok) {
      throw new Error('An API error occurred without a JSON response');
    }
    return;
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

// === User Management Endpoints ===
export const getUsers = (params?: { page?: number; limit?: number; search?: string; role?: string; status?: string }) => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.role) queryParams.append('role', params.role);
  if (params?.status) queryParams.append('status', params.status);

  const queryString = queryParams.toString();
  return fetchApi(`/admin/users${queryString ? `?${queryString}` : ''}`);
};

export const getUser = (id: string) => fetchApi(`/admin/users/${id}`);

export const createUser = (userData: {
  username: string;
  email: string;
  fullName: string;
  roleId: string;
  unitKerja?: string;
}) => fetchApi('/admin/users', {
  method: 'POST',
  body: JSON.stringify(userData),
});

export const updateUser = (id: string, userData: {
  username?: string;
  email?: string;
  fullName?: string;
  roleId?: string;
  unitKerja?: string;
  isActive?: boolean;
}) => fetchApi(`/admin/users/${id}`, {
  method: 'PUT',
  body: JSON.stringify(userData),
});

export const updateUserRole = (id: string, roleId: string) => fetchApi(`/admin/users/${id}/role`, {
  method: 'PATCH',
  body: JSON.stringify({ roleId }),
});

export const toggleUserStatus = (id: string, isActive: boolean) => fetchApi(`/admin/users/${id}/status`, {
  method: 'PATCH',
  body: JSON.stringify({ isActive }),
});

export const resetUserPassword = (id: string) => fetchApi(`/admin/users/${id}/reset-password`, {
  method: 'POST',
});

export const deleteUserAccount = (id: string) => fetchApi(`/admin/users/${id}`, {
  method: 'DELETE',
});

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

// === Document Management Endpoints ===
export const createDocument = (templateId: string) => fetchApi('/documents', {
  method: 'POST',
  body: JSON.stringify({ templateId }), // Hanya kirim templateId
});

export const getDocument = (id: string) => fetchApi(`/documents/${id}`);

export const updateDocument = (id: string, data: { title: string; content: string; docNo: string; priority: string; }) => fetchApi(`/documents/${id}`, {
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

export const getDocumentHistory = (docId: string) => fetchApi(`/documents/${docId}/history`);
export const getVersionHistory = (docId: string) => fetchApi(`/documents/${docId}/versions`);
export const compareVersions = (docId: string, fromId: string, toId: string) => {
  return fetchApi(`/documents/${docId}/versions/compare?from=${fromId}&to=${toId}`);
};
export const getTemplates = () => fetchApi('/templates');
export const getDocumentTemplates = () => fetchApi('/document-templates');


export const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append('image', file);

  return fetchApi('/upload/image', {
    method: 'POST',
    body: formData,
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
