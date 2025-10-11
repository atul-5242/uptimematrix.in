"use client";

import { useAppSelector } from "@/store";
import { ALL_PERMISSIONS, getPermissionDescription, formatPermissionName } from "@/lib/permissions";

/**
 * usePermissions: read the current user's role and permissions for the selected org
 * from Redux and provide ergonomic helpers to check permissions in components.
 */
export function usePermissions() {
  const { selectedOrganizationRole, selectedOrganizationPermissions } = useAppSelector(
    (state) => state.user
  );

  const hasPermission = (perm: string) => {
    if (selectedOrganizationRole === "Admin") return true;
    return selectedOrganizationPermissions?.includes(perm) ?? false;
  };

  const hasAny = (perms: string[]) => {
    if (selectedOrganizationRole === "Admin") return true;
    return perms.some((p) => selectedOrganizationPermissions?.includes(p));
  };

  const hasAll = (perms: string[]) => {
    if (selectedOrganizationRole === "Admin") return true;
    return perms.every((p) => selectedOrganizationPermissions?.includes(p));
  };

  const isRole = (role: string) => selectedOrganizationRole === role;

  const isAdmin = () => selectedOrganizationRole === "Admin";

  const getPermissionDescriptionWrapper = (permission: string) => {
    return getPermissionDescription(permission);
  };

  const formatPermission = (permission: string) => {
    return formatPermissionName(permission);
  };

  return {
    role: selectedOrganizationRole,
    permissions: selectedOrganizationPermissions,
    hasPermission,
    hasAny,
    hasAll,
    isRole,
    isAdmin,
    getPermissionDescription: getPermissionDescriptionWrapper,
    formatPermission,
  };
}
