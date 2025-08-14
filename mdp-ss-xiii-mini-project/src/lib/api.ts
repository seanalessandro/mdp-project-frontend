// /src/lib/api.ts

import { LoginRequest, RoleRequest, AdminCreateUserRequest } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3033/api';

async function fetchApi(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers });
  
  if (response.status === 204) {
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

// === User Management Endpoints ===
export const getUsers = () => fetchApi('/admin/users');
export const createUser = (userData: AdminCreateUserRequest) => fetchApi('/admin/users', {
  method: 'POST',
  body: JSON.stringify(userData),
});