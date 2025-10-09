/**
 * Permission constants and utilities for the application
 * This file defines all available permissions and provides utility functions
 */

// Organization Permissions
export const ORGANIZATION_PERMISSIONS = {
  CREATE: 'organization:create',
  SELECT: 'organization:select',
  DELETE: 'organization:delete',
  MANAGE_TEAM: 'organization:manage_team',
} as const;

// Monitoring Permissions
export const MONITOR_PERMISSIONS = {
  CREATE: 'monitor:create',
  EDIT: 'monitor:edit',
  DELETE: 'monitor:delete',
} as const;

// Escalation Policy Permissions
export const ESCALATION_POLICY_PERMISSIONS = {
  CREATE: 'escalation_policy:create',
  EDIT: 'escalation_policy:edit',
  DELETE: 'escalation_policy:delete',
} as const;

// Integration Permissions
export const INTEGRATION_PERMISSIONS = {
  CREATE: 'integration:create',
  EDIT: 'integration:edit',
  DELETE: 'integration:delete',
} as const;

// Status Page Permissions
export const STATUS_PAGE_PERMISSIONS = {
  CREATE: 'status_page:create',
  EDIT: 'status_page:edit',
  DELETE: 'status_page:delete',
} as const;

// Team Management Permissions
export const TEAM_PERMISSIONS = {
  CREATE: 'team:create',
  EDIT: 'team:edit',
  DELETE: 'team:delete',
  ADD_MEMBER: 'team:add_member',
  REMOVE_MEMBER: 'team:remove_member',
} as const;

// Member Management Permissions
export const MEMBER_PERMISSIONS = {
  INVITE: 'member:invite',
  EDIT: 'member:edit',
} as const;

// Role Management Permissions
export const ROLE_PERMISSIONS = {
  CREATE: 'role:create',
  EDIT: 'role:edit',
  DELETE: 'role:delete',
  MANAGE_PERMISSIONS: 'role:manage_permissions',
} as const;

// General System Permissions
export const SYSTEM_PERMISSIONS = {
  FULL_ACCESS: 'full_access',
  BILLING: 'billing',
  REPORTING: 'reporting',
  TEAM_MANAGEMENT: 'team_management',
  MONITORING: 'monitoring',
  INCIDENT_MANAGEMENT: 'incident_management',
  API_ACCESS: 'api_access',
  USER_MANAGEMENT: 'user_management',
  SECURITY_SETTINGS: 'security_settings',
  INTEGRATIONS: 'integrations',
  NOTIFICATIONS: 'notifications',
  ANALYTICS: 'analytics',
  BACKUP_RESTORE: 'backup_restore',
  AUDIT_LOGS: 'audit_logs',
  CUSTOM_SCRIPTS: 'custom_scripts',
} as const;

// All permissions combined
export const ALL_PERMISSIONS = {
  ...ORGANIZATION_PERMISSIONS,
  ...MONITOR_PERMISSIONS,
  ...ESCALATION_POLICY_PERMISSIONS,
  ...INTEGRATION_PERMISSIONS,
  ...STATUS_PAGE_PERMISSIONS,
  ...TEAM_PERMISSIONS,
  ...MEMBER_PERMISSIONS,
  ...ROLE_PERMISSIONS,
  ...SYSTEM_PERMISSIONS,
} as const;

// Permission groups for easier management
export const PERMISSION_GROUPS = {
  ORGANIZATION: Object.values(ORGANIZATION_PERMISSIONS),
  MONITORING: Object.values(MONITOR_PERMISSIONS),
  ESCALATION_POLICIES: Object.values(ESCALATION_POLICY_PERMISSIONS),
  INTEGRATIONS: Object.values(INTEGRATION_PERMISSIONS),
  STATUS_PAGES: Object.values(STATUS_PAGE_PERMISSIONS),
  TEAMS: Object.values(TEAM_PERMISSIONS),
  MEMBERS: Object.values(MEMBER_PERMISSIONS),
  ROLES: Object.values(ROLE_PERMISSIONS),
  SYSTEM: Object.values(SYSTEM_PERMISSIONS),
} as const;

// Permission descriptions for UI
export const PERMISSION_DESCRIPTIONS = {
  [ORGANIZATION_PERMISSIONS.CREATE]: 'Create new organizations',
  [ORGANIZATION_PERMISSIONS.SELECT]: 'Select and switch between organizations',
  [ORGANIZATION_PERMISSIONS.DELETE]: 'Delete organizations',
  [ORGANIZATION_PERMISSIONS.MANAGE_TEAM]: 'Manage organization team members',
  
  [MONITOR_PERMISSIONS.CREATE]: 'Create new monitors',
  [MONITOR_PERMISSIONS.EDIT]: 'Edit existing monitors',
  [MONITOR_PERMISSIONS.DELETE]: 'Delete monitors',
  
  [ESCALATION_POLICY_PERMISSIONS.CREATE]: 'Create new escalation policies',
  [ESCALATION_POLICY_PERMISSIONS.EDIT]: 'Edit existing escalation policies',
  [ESCALATION_POLICY_PERMISSIONS.DELETE]: 'Delete escalation policies',
  
  [INTEGRATION_PERMISSIONS.CREATE]: 'Create new integrations',
  [INTEGRATION_PERMISSIONS.EDIT]: 'Edit existing integrations',
  [INTEGRATION_PERMISSIONS.DELETE]: 'Delete integrations',
  
  [STATUS_PAGE_PERMISSIONS.CREATE]: 'Create new status pages',
  [STATUS_PAGE_PERMISSIONS.EDIT]: 'Edit existing status pages',
  [STATUS_PAGE_PERMISSIONS.DELETE]: 'Delete status pages',
  
  [TEAM_PERMISSIONS.CREATE]: 'Create new teams',
  [TEAM_PERMISSIONS.EDIT]: 'Edit existing teams',
  [TEAM_PERMISSIONS.DELETE]: 'Delete teams',
  [TEAM_PERMISSIONS.ADD_MEMBER]: 'Add members to teams',
  [TEAM_PERMISSIONS.REMOVE_MEMBER]: 'Remove members from teams',
  
  [MEMBER_PERMISSIONS.INVITE]: 'Invite new members',
  [MEMBER_PERMISSIONS.EDIT]: 'Edit member profiles',
  
  [ROLE_PERMISSIONS.CREATE]: 'Create new roles',
  [ROLE_PERMISSIONS.EDIT]: 'Edit existing roles',
  [ROLE_PERMISSIONS.DELETE]: 'Delete roles',
  [ROLE_PERMISSIONS.MANAGE_PERMISSIONS]: 'Manage role permissions',
  
  [SYSTEM_PERMISSIONS.FULL_ACCESS]: 'Complete system access',
  [SYSTEM_PERMISSIONS.BILLING]: 'Manage billing and subscriptions',
  [SYSTEM_PERMISSIONS.REPORTING]: 'Access to reports and analytics',
  [SYSTEM_PERMISSIONS.TEAM_MANAGEMENT]: 'Manage teams and members',
  [SYSTEM_PERMISSIONS.MONITORING]: 'Access to monitoring tools',
  [SYSTEM_PERMISSIONS.INCIDENT_MANAGEMENT]: 'Manage incidents and alerts',
  [SYSTEM_PERMISSIONS.API_ACCESS]: 'Access to API endpoints',
  [SYSTEM_PERMISSIONS.USER_MANAGEMENT]: 'Manage user accounts',
  [SYSTEM_PERMISSIONS.SECURITY_SETTINGS]: 'Configure security settings',
  [SYSTEM_PERMISSIONS.INTEGRATIONS]: 'Manage integrations',
  [SYSTEM_PERMISSIONS.NOTIFICATIONS]: 'Configure notifications',
  [SYSTEM_PERMISSIONS.ANALYTICS]: 'Access to analytics dashboard',
  [SYSTEM_PERMISSIONS.BACKUP_RESTORE]: 'Backup and restore data',
  [SYSTEM_PERMISSIONS.AUDIT_LOGS]: 'View audit logs',
  [SYSTEM_PERMISSIONS.CUSTOM_SCRIPTS]: 'Run custom scripts',
} as const;

/**
 * Get human-readable description for a permission
 */
export function getPermissionDescription(permission: string): string {
  return PERMISSION_DESCRIPTIONS[permission as keyof typeof PERMISSION_DESCRIPTIONS] || 'Custom permission';
}

/**
 * Format permission name for display
 */
export function formatPermissionName(permission: string): string {
  return permission.replace(/_/g, ' ').replace(/:/g, ' - ');
}

/**
 * Check if a permission is a system-level permission
 */
export function isSystemPermission(permission: string): boolean {
  return Object.values(SYSTEM_PERMISSIONS).includes(permission as any);
}

/**
 * Get all permissions in a specific group
 */
export function getPermissionsByGroup(group: keyof typeof PERMISSION_GROUPS): readonly string[] {
  return PERMISSION_GROUPS[group];
}

/**
 * Common permission combinations for different features
 */
export const FEATURE_PERMISSIONS = {
  INCIDENT_MANAGEMENT: [SYSTEM_PERMISSIONS.INCIDENT_MANAGEMENT],
  MONITOR_MANAGEMENT: [MONITOR_PERMISSIONS.CREATE, MONITOR_PERMISSIONS.EDIT, MONITOR_PERMISSIONS.DELETE],
  TEAM_MANAGEMENT: [TEAM_PERMISSIONS.CREATE, TEAM_PERMISSIONS.EDIT, TEAM_PERMISSIONS.DELETE],
  MEMBER_MANAGEMENT: [MEMBER_PERMISSIONS.INVITE, MEMBER_PERMISSIONS.EDIT],
  ROLE_MANAGEMENT: [ROLE_PERMISSIONS.CREATE, ROLE_PERMISSIONS.EDIT, ROLE_PERMISSIONS.DELETE],
  ANALYTICS_ACCESS: [SYSTEM_PERMISSIONS.ANALYTICS, SYSTEM_PERMISSIONS.REPORTING],
} as const;