import { LoginRequest, RoleRequest, MenuType, RoleMenuMappingRequest, ApprovalHistoryEntry, TokenResponse, RefreshTokenRequest } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3033/api';
import { CreateCommentPayload } from './types';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  
  failedQueue = [];
};

async function refreshAccessToken(): Promise<string> {
  // Ensure we're in browser environment
  if (typeof window === 'undefined') {
    throw new Error('Cannot refresh token in server environment');
  }
  
  const refreshToken = localStorage.getItem('refreshToken');
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    // Clear invalid tokens
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    throw new Error('Failed to refresh token');
  }

  const data: TokenResponse = await response.json();
  
  // Update stored tokens
  localStorage.setItem('token', data.token);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('user', JSON.stringify(data.user));
  localStorage.setItem('role', JSON.stringify(data.role));
  
  return data.token;
}

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

  let response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers, body });

  // Handle token expiration
  if (response.status === 401 && token) {
    const errorData = await response.json().catch(() => ({}));
    
    if (errorData.code === 'TOKEN_EXPIRED') {
      if (isRefreshing) {
        // If already refreshing, wait for it to complete
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          headers['Authorization'] = `Bearer ${newToken}`;
          return fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers, body });
        });
      }

      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);
        
        // Retry the original request with new token
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers, body });
      } catch (refreshError) {
        const error = refreshError instanceof Error ? refreshError : new Error('Token refresh failed');
        processQueue(error, null);
        
        // Clear tokens and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          localStorage.removeItem('role');
          window.location.href = '/auth/login';
        }
        
        throw error;
      } finally {
        isRefreshing = false;
      }
    }
  }

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
export const refreshToken = (refreshTokenData: RefreshTokenRequest) => fetchApi('/auth/refresh', {
  method: 'POST',
  body: JSON.stringify(refreshTokenData),
});
export const getProfile = () => fetchApi('/profile');
export const getUserProfile = () => fetchApi('/profile');
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
export const getAllDocuments = () => fetchApi('/documents/all');
export const getDashboardStats = () => fetchApi('/documents/stats');
export const deleteDocument = (id: string) => fetchApi(`/documents/${id}`, {
  method: 'DELETE',
});

// Approval Workflow API functions
export const submitDocumentForReview = (id: string) => fetchApi(`/documents/${id}/submit-review`, {
  method: 'POST',
});

export const approveDocument = (id: string, comments?: string) => fetchApi(`/documents/${id}/approve`, {
  method: 'POST',
  body: JSON.stringify({ comments: comments || '' }),
});

export const rejectDocument = (id: string, comments: string) => fetchApi(`/documents/${id}/reject`, {
  method: 'POST',
  body: JSON.stringify({ comments }),
});

export const getDocumentApprovalStatus = (id: string) => fetchApi(`/documents/${id}/approval-status`);

export const checkDocumentCodaStatus = (id: string) => fetchApi(`/documents/${id}/coda-status`);

export const retryCodaSync = (id: string) => fetchApi(`/documents/${id}/coda-retry`, { method: 'POST' });

export const fetchDocumentDevelopmentStatus = (id: string) => fetchApi(`/documents/${id}/coda-dev-status`);

export const getPendingDocumentsForApproval = (role: string) => fetchApi(`/approval/${role.toLowerCase()}/pending`);
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


export const getMenus = async (): Promise<MenuType[]> => {
  const response = await fetchApi('/admin/menus');
  return response as MenuType[];
};

export const createMenu = async (menuData: Omit<MenuType, 'id' | 'createdOn' | 'modifiedOn'>): Promise<MenuType> => {
  const response = await fetchApi('/admin/menus', {
    method: 'POST',
    body: JSON.stringify(menuData),
  });
  return response as MenuType;
};

export const updateMenu = async (id: string, menuData: Partial<MenuType>): Promise<void> => {
  await fetchApi(`/admin/menus/${id}`, {
    method: 'PUT',
    body: JSON.stringify(menuData),
  });
};

export const deleteMenu = async (id: string): Promise<void> => {
  await fetchApi(`/admin/menus/${id}`, {
    method: 'DELETE',
  });
};

export const updateMenuStatus = async (id: string, isActive: boolean): Promise<void> => {
  await fetchApi(`/admin/menus/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  });
};


export const createRoleMenuMapping = (data: RoleMenuMappingRequest) => fetchApi('/admin/role-menu-mappings', {
  method: 'POST',
  body: JSON.stringify(data),
});

export const getRoleMenuMappings = () => fetchApi('/admin/role-menu-mappings');

// Get menus for current user's role
export const getUserMenus = () => fetchApi('/user/menus');

export const getRoleMenuMapping = (id: string) => fetchApi(`/admin/role-menu-mappings/${id}`);

export const updateRoleMenuMapping = (id: string, data: RoleMenuMappingRequest) => fetchApi(`/admin/role-menu-mappings/${id}`, {
  method: 'PUT',
  body: JSON.stringify(data),
});

export const deleteRoleMenuMapping = (id: string) => fetchApi(`/admin/role-menu-mappings/${id}`, {
  method: 'DELETE',
});

export const getDocumentApprovalHistory = (docId: string): Promise<ApprovalHistoryEntry[]> => fetchApi('/documents/' + docId + '/approval-history');
export const reviseDocument = (docId: string) => fetchApi(`/documents/${docId}/revise`, {
    method: 'POST',
});

