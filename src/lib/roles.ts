import type { UserRole } from '@/types'

export type Permission =
  | 'sessions:create'
  | 'sessions:approve'
  | 'reports:approve'
  | 'certificates:issue'
  | 'users:manage'
  | 'sessions:view'

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ROLE_TRAINER: ['sessions:create', 'sessions:view'],
  ROLE_COUNTY_OFFICER: ['sessions:view', 'sessions:approve', 'reports:approve'],
  ROLE_NATIONAL_ADMIN: ['sessions:view', 'certificates:issue'],
  ROLE_ME_MANAGER: ['sessions:view'],
  ROLE_SYSTEM_ADMIN: ['sessions:create', 'sessions:view', 'sessions:approve', 'reports:approve', 'certificates:issue', 'users:manage'],
  ROLE_TRAINEE: [],
}

export function hasPermission(role: UserRole, permission: Permission) {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false
}

export function isStaffRole(role: UserRole) {
  return role !== 'ROLE_TRAINEE'
}
