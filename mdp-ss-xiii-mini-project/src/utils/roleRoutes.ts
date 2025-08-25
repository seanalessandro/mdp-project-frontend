import { Role } from '@/lib/types';

export interface RoleRouteConfig {
  defaultPath: string;
  allowedPaths: string[];
  dashboardComponent: string;
}

export const ROLE_ROUTES: Record<string, RoleRouteConfig> = {
  admin: {
    defaultPath: '/dashboard',
    allowedPaths: [
      '/dashboard',
      '/dashboard/manage-users',
      '/dashboard/manage-roles',
      '/dashboard/documents',
      '/dashboard/reports',
      '/dashboard/settings'
    ],
    dashboardComponent: 'AdminDashboard'
  },
  super_admin: {
    defaultPath: '/dashboard',
    allowedPaths: [
      '/dashboard',
      '/dashboard/manage-users',
      '/dashboard/manage-roles',
      '/dashboard/documents',
      '/dashboard/reports',
      '/dashboard/settings',
      '/dashboard/system'
    ],
    dashboardComponent: 'AdminDashboard'
  },
  editor: {
    defaultPath: '/dashboard',
    allowedPaths: [
      '/dashboard',
      '/dashboard/documents',
      '/dashboard/documents/new',
      '/dashboard/documents/edit',
      '/dashboard/profile'
    ],
    dashboardComponent: 'EditorDashboard'
  },
  reviewer: {
    defaultPath: '/dashboard',
    allowedPaths: [
      '/dashboard',
      '/dashboard/documents',
      '/dashboard/documents/review',
      '/dashboard/profile'
    ],
    dashboardComponent: 'ReviewerDashboard'
  },
  user: {
    defaultPath: '/dashboard',
    allowedPaths: [
      '/dashboard',
      '/dashboard/documents',
      '/dashboard/profile'
    ],
    dashboardComponent: 'UserDashboard'
  }
};

/**
 * Get the appropriate dashboard route for a user role
 * FR-5.2.3.1: Sistem harus mengidentifikasi role user setelah login
 */
export function getRoleBasedRoute(role: Role | null): string {
  if (!role) {
    return '/auth/login';
  }

  const roleName = role.name.toLowerCase();
  const roleConfig = ROLE_ROUTES[roleName];
  
  if (!roleConfig) {
    // Default fallback for unknown roles
    return '/dashboard';
  }

  return roleConfig.defaultPath;
}

/**
 * Check if a user role has access to a specific path
 * FR-5.2.3.2: Sistem mengarahkan user ke halaman dashboard spesifik sesuai role
 */
export function hasRoleAccess(role: Role | null, path: string): boolean {
  if (!role) {
    return false;
  }

  const roleName = role.name.toLowerCase();
  const roleConfig = ROLE_ROUTES[roleName];
  
  if (!roleConfig) {
    // Default access for unknown roles (basic dashboard only)
    return path === '/dashboard' || path === '/dashboard/profile';
  }

  return roleConfig.allowedPaths.some(allowedPath => {
    // Exact match or path starts with allowed path (for sub-routes)
    return path === allowedPath || path.startsWith(allowedPath + '/');
  });
}

/**
 * Get the dashboard component name for a role
 */
export function getDashboardComponent(role: Role | null): string {
  if (!role) {
    return 'DefaultDashboard';
  }

  const roleName = role.name.toLowerCase();
  const roleConfig = ROLE_ROUTES[roleName];
  
  return roleConfig?.dashboardComponent || 'DefaultDashboard';
}

/**
 * Get role-specific navigation items
 */
export function getRoleNavigationItems(role: Role | null) {
  if (!role) {
    return [];
  }

  const roleName = role.name.toLowerCase();
  
  const baseItems = [
    { key: '/dashboard', icon: 'DesktopOutlined', label: 'Dashboard' },
  ];

  const roleSpecificItems = {
    admin: [
      { key: '/dashboard/manage-users', icon: 'TeamOutlined', label: 'Manage Users' },
      { key: '/dashboard/manage-roles', icon: 'UserOutlined', label: 'Master Role' },
      { key: '/dashboard/documents', icon: 'FileTextOutlined', label: 'Documents' },
      { key: '/dashboard/reports', icon: 'BarChartOutlined', label: 'Reports' },
      { key: '/dashboard/settings', icon: 'SettingOutlined', label: 'Settings' },
    ],
    super_admin: [
      { key: '/dashboard/manage-users', icon: 'TeamOutlined', label: 'Manage Users' },
      { key: '/dashboard/manage-roles', icon: 'UserOutlined', label: 'Master Role' },
      { key: '/dashboard/documents', icon: 'FileTextOutlined', label: 'Documents' },
      { key: '/dashboard/reports', icon: 'BarChartOutlined', label: 'Reports' },
      { key: '/dashboard/settings', icon: 'SettingOutlined', label: 'Settings' },
      { key: '/dashboard/system', icon: 'DatabaseOutlined', label: 'System Admin' },
    ],
    editor: [
      { key: '/dashboard/documents', icon: 'FileTextOutlined', label: 'My Documents' },
      { key: '/dashboard/documents/new', icon: 'PlusOutlined', label: 'Create Document' },
    ],
    reviewer: [
      { key: '/dashboard/documents', icon: 'FileTextOutlined', label: 'Review Documents' },
    ],
    user: [
      { key: '/dashboard/documents', icon: 'FileTextOutlined', label: 'Documents' },
    ],
  };

  const roleItems = roleSpecificItems[roleName as keyof typeof roleSpecificItems] || [];
  
  return [
    ...baseItems,
    ...roleItems,
    { key: '/dashboard/profile', icon: 'UserOutlined', label: 'Profile' },
  ];
}
