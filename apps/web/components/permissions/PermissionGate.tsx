"use client";

import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from '@/hooks/use-toast';

interface PermissionGateProps {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  showToast?: boolean;
  toastMessage?: string;
  children: React.ReactNode;
}

/**
 * PermissionGate - Conditionally renders children based on user permissions
 * Shows a fallback UI or nothing if user lacks required permissions
 */
export function PermissionGate({ 
  permission, 
  permissions = [], 
  requireAll = false,
  fallback = null,
  showToast = false,
  toastMessage = "You don't have permission to perform this action. Please contact your administrator.",
  children 
}: PermissionGateProps) {
  const { hasPermission, hasAny, hasAll, role } = usePermissions();

  // Admin users have all permissions
  if (role === 'Admin') {
    return <>{children}</>;
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions.length > 0) {
    hasAccess = requireAll ? hasAll(permissions) : hasAny(permissions);
  } else {
    // No permissions specified, allow access
    hasAccess = true;
  }

  if (!hasAccess) {
    if (showToast) {
      toast({
        variant: 'destructive',
        title: 'Permission Denied',
        description: toastMessage,
      });
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface PermissionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  permission?: string;
  permissions?: string[];
  requireAll?: boolean;
  showTooltip?: boolean;
  tooltipMessage?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * PermissionButton - Button that's disabled if user lacks permissions
 * Shows tooltip explaining why button is disabled
 */
export function PermissionButton({
  permission,
  permissions = [],
  requireAll = false,
  showTooltip = true,
  tooltipMessage = "You don't have permission to perform this action",
  children,
  className = "",
  onClick,
  disabled = false,
  ...props
}: PermissionButtonProps) {
  const { hasPermission, hasAny, hasAll, role } = usePermissions();

  // Admin users have all permissions
  if (role === 'Admin') {
    return (
      <button 
        className={className} 
        onClick={onClick} 
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(permission);
  } else if (permissions.length > 0) {
    hasAccess = requireAll ? hasAll(permissions) : hasAny(permissions);
  } else {
    // No permissions specified, allow access
    hasAccess = true;
  }

  const isDisabled = disabled || !hasAccess;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!hasAccess) {
      e.preventDefault();
      if (showTooltip) {
        toast({
          variant: 'destructive',
          title: 'Permission Denied',
          description: tooltipMessage,
        });
      }
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button 
      className={`${className} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={handleClick}
      disabled={isDisabled}
      title={!hasAccess ? tooltipMessage : undefined}
      {...props}
    >
      {children}
    </button>
  );
}