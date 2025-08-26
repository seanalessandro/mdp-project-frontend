// /src/lib/types.ts

// Tipe dasar dari backend Go
export interface BaseModel {
  id: string;
  createdOn: string;
  createdBy?: string;
  modifiedOn: string;
  modifiedBy?: string;
}

// Tipe untuk Role
export interface Role extends BaseModel {
  name: string;
  description: string;
  isActive: boolean;
  isDefault: boolean;
  permissions: string[];
}

// Tipe untuk User
export interface User extends BaseModel {
  username: string;
  email: string;
  roleId: string;
  isActive: boolean;
  lastLogin?: string;
  provider: string;
}

// Tipe untuk respons login lengkap
export interface LoginResponse {
  token: string;
  user: User;
  role: Role;
}

// Tipe untuk body request
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RoleRequest {
  name: string;
  description: string;
  permissions: string[];
}

export interface AdminCreateUserRequest {
  username: string;
  email: string;
  password: string;
  roleId: string;
}
export interface Document extends BaseModel {
  title: string;
  content: string;
  ownerId: string;
  status: string;
  docNo: string;
  version: number;
  priority: 'High' | 'Medium' | 'Low';
}
export interface Comment extends BaseModel {
  documentId: string;
  content: string;
  authorName: string;
}
export interface CreateCommentPayload {
  content: string;
  markedText?: string; // Opsional, hanya untuk komentar utama yang sederhana
  parentId?: string;   // Opsional, hanya untuk balasan
}

export interface CreateDocumentPayload {
  title: string;
  docNo: string;
  priority: string;
}
export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
}
export interface DocumentTemplate extends BaseModel {
  name: string;
  description: string;
  thumbnailUrl: string; // <-- Properti yang hilang
  content: string;
}

export interface ActivityLog {
  id: string;
  documentId?: string;
  userId: string;
  username: string;
  action: string;
  timestamp: string;
}
export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  content: string;
  changeDescription: string;
  createdOn: string;
  createdByUsername?: string;
  createdBy?: string;
}