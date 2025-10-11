"use client";

import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionAlertProps {
  requiredPermission?: string;
  requiredPermissions?: string[];
  requireAll?: boolean;
  title?: string;
  message?: string;
  className?: string;
}

/**
 * PermissionAlert - Shows a warning alert when user lacks required permissions
 * Only shows if user doesn't have the required permissions
 */
export function PermissionAlert({
  requiredPermission,
  requiredPermissions = [],
  requireAll = false,
  title = "Insufficient Permissions",
  message,
  className = ""
}: PermissionAlertProps) {
  const { hasPermission, hasAny, hasAll, role } = usePermissions();

  // Admin users have all permissions
  if (role === 'Admin') {
    return null;
  }

  let hasAccess = false;
  let missingPermissions: string[] = [];

  if (requiredPermission) {
    hasAccess = hasPermission(requiredPermission);
    if (!hasAccess) {
      missingPermissions = [requiredPermission];
    }
  } else if (requiredPermissions.length > 0) {
    if (requireAll) {
      hasAccess = hasAll(requiredPermissions);
      if (!hasAccess) {
        missingPermissions = requiredPermissions.filter(p => !hasPermission(p));
      }
    } else {
      hasAccess = hasAny(requiredPermissions);
      if (!hasAccess) {
        missingPermissions = requiredPermissions;
      }
    }
  } else {
    // No permissions specified, don't show alert
    return null;
  }

  // Don't show if user has access
  if (hasAccess) {
    return null;
  }

  const defaultMessage = `You need ${requireAll ? 'all of the following' : 'at least one of the following'} permissions to access this feature: ${missingPermissions.map(p => p.replace('_', ' ')).join(', ')}. Please contact your administrator to request access.`;

  return (
    <Alert className={`border-yellow-200 bg-yellow-50 ${className}`}>
      <AlertTriangle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="text-yellow-800">
        <div className="font-medium mb-1">{title}</div>
        <div className="text-sm">{message || defaultMessage}</div>
      </AlertDescription>
    </Alert>
  );
}

interface PermissionBannerProps {
  requiredPermission?: string;
  requiredPermissions?: string[];
  requireAll?: boolean;
  title?: string;
  message?: string;
  showContactInfo?: boolean;
  className?: string;
}

/**
 * PermissionBanner - Shows a prominent banner for pages that require specific permissions
 * Useful for entire page access restrictions
 */
export function PermissionBanner({
  requiredPermission,
  requiredPermissions = [],
  requireAll = false,
  title = "Access Restricted",
  message,
  showContactInfo = true,
  className = ""
}: PermissionBannerProps) {
  const { hasPermission, hasAny, hasAll, role } = usePermissions();

  // Admin users have all permissions
  if (role === 'Admin') {
    return null;
  }

  let hasAccess = false;
  let missingPermissions: string[] = [];

  if (requiredPermission) {
    hasAccess = hasPermission(requiredPermission);
    if (!hasAccess) {
      missingPermissions = [requiredPermission];
    }
  } else if (requiredPermissions.length > 0) {
    if (requireAll) {
      hasAccess = hasAll(requiredPermissions);
      if (!hasAccess) {
        missingPermissions = requiredPermissions.filter(p => !hasPermission(p));
      }
    } else {
      hasAccess = hasAny(requiredPermissions);
      if (!hasAccess) {
        missingPermissions = requiredPermissions;
      }
    }
  } else {
    // No permissions specified, don't show banner
    return null;
  }

  // Don't show if user has access
  if (hasAccess) {
    return null;
  }

  const defaultMessage = `This section requires ${requireAll ? 'all of the following' : 'at least one of the following'} permissions: ${missingPermissions.map(p => p.replace('_', ' ')).join(', ')}.`;

  return (
    <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center ${className}`}>
      <div className="flex items-center justify-center mb-4">
        <Shield className="h-12 w-12 text-yellow-600" />
      </div>
      <h3 className="text-lg font-semibold text-yellow-900 mb-2">{title}</h3>
      <p className="text-yellow-800 mb-4">{message || defaultMessage}</p>
      {showContactInfo && (
        <p className="text-sm text-yellow-700">
          Please contact your administrator to request the necessary permissions.
        </p>
      )}
    </div>
  );
}