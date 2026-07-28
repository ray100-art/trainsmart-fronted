import type { UserRole } from '@/types'

export type Permission =
  | 'sessions:create'
  | 'sessions:approve'
  | 'reports:approve'
  | 'certificates:issue'
  | 'users:manage'
  | 'sessions:view'
  | 'analytics:view'
  | 'reports:export'
  | 'audit:view'
  | 'programs:manage'
  | 'people:view'
  | 'people:manage'
  | 'catalogs:manage'

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ROLE_TRAINER: ['sessions:create', 'sessions:view', 'people:view', 'people:manage'],
  ROLE_SITE_COORDINATOR: [
    'sessions:create', 'sessions:view', 'people:view', 'people:manage',
  ],
  ROLE_COUNTY_OFFICER: [
    'sessions:view', 'sessions:approve', 'reports:approve', 'people:view', 'people:manage',
  ],
  ROLE_NATIONAL_ADMIN: [
    'sessions:view', 'sessions:approve', 'reports:approve', 'certificates:issue',
    'analytics:view', 'reports:export', 'audit:view', 'people:view', 'people:manage',
  ],
  ROLE_ME_MANAGER: ['sessions:view', 'analytics:view', 'reports:export', 'audit:view'],
  ROLE_SYSTEM_ADMIN: [
    'sessions:create', 'sessions:view', 'sessions:approve', 'reports:approve',
    'certificates:issue', 'users:manage', 'analytics:view', 'reports:export',
    'audit:view', 'programs:manage', 'people:view', 'people:manage', 'catalogs:manage',
  ],
  ROLE_TRAINEE: [],
}

/** Roles restricted to their own county for lists/create. */
export const COUNTY_SCOPED_ROLES: UserRole[] = [
  'ROLE_TRAINER',
  'ROLE_SITE_COORDINATOR',
  'ROLE_COUNTY_OFFICER',
]

export function isCountyScopedRole(role: UserRole) {
  return COUNTY_SCOPED_ROLES.includes(role)
}

export function hasPermission(role: UserRole, permission: Permission) {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function hasAnyPermission(role: UserRole, permissions: Permission[]) {
  return permissions.some((p) => hasPermission(role, p))
}

export function isStaffRole(role: UserRole) {
  return role !== 'ROLE_TRAINEE'
}
