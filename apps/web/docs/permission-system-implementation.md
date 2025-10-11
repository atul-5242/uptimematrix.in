# Permission System Implementation Guide

## Overview

This document outlines the comprehensive permission system implemented for the UptimeMatrix application. The system provides both backend authorization and frontend UI restrictions to ensure users only see and can interact with features they have permissions for.

## ✅ What Has Been Implemented

### 1. Backend Permission System (Already Existing)
- **Authorization Middleware**: `apps/api/middlewares/authorization.ts`
  - `requirePermission(permission)` - Requires specific permission
  - `requireAnyPermission(permissions[])` - Requires at least one permission from list
  - `userHasPermission()` - Checks if user has specific permission
- **Proper HTTP Status Codes**: 
  - `401 Unauthorized` for authentication issues
  - `403 Forbidden` for permission issues
- **Error Messages**: Clear error messages explaining permission requirements

### 2. Frontend Error Handling (Already Existing)
- **Error Handler**: `apps/web/lib/errorHandler.ts`
  - Handles 403 errors with user-friendly messages
  - Shows toast notifications for permission errors
- **API Fetch Utility**: `apps/web/lib/apiFetch.ts`
  - Automatically shows permission denied notifications
  - Handles authentication and permission errors

### 3. Permission Checking Hook (Already Existing)
- **usePermissions Hook**: `apps/web/hooks/usePermissions.ts`
  - `hasPermission(permission)` - Check single permission
  - `hasAny(permissions[])` - Check if user has any from list
  - `hasAll(permissions[])` - Check if user has all from list
  - `isRole(role)` - Check user role
  - `isAdmin()` - Check if user is admin

### 4. NEW: Permission UI Components

#### PermissionGate Component
**Location**: `apps/web/components/permissions/PermissionGate.tsx`

```tsx
// Hide/show content based on permissions
<PermissionGate 
  permission="team:create"
  fallback={<DisabledButton />}
>
  <Button onClick={createTeam}>Create Team</Button>
</PermissionGate>

// Check multiple permissions
<PermissionGate 
  permissions={['incident_management', 'analytics']}
  requireAll={false} // OR logic (default)
>
  <AnalyticsButton />
</PermissionGate>
```

#### Permission Alert Components
**Location**: `apps/web/components/permissions/PermissionAlert.tsx`

```tsx
// Show warning when user lacks permissions
<PermissionAlert 
  requiredPermission="monitor:create"
  title="Cannot Create Monitors"
  message="You need monitor creation permissions to access this feature."
/>

// Show banner for entire page restrictions
<PermissionBanner 
  requiredPermissions={['team:create', 'team:edit']}
  title="Team Management Restricted"
  showContactInfo={true}
/>
```

### 5. NEW: Permission Constants and Utilities
**Location**: `apps/web/lib/permissions.ts`

Organized permission constants by feature:
- `ORGANIZATION_PERMISSIONS` - Organization management
- `MONITOR_PERMISSIONS` - Monitor management  
- `TEAM_PERMISSIONS` - Team management
- `MEMBER_PERMISSIONS` - Member management
- `ROLE_PERMISSIONS` - Role management
- `SYSTEM_PERMISSIONS` - System-wide permissions

Utility functions:
- `getPermissionDescription()` - Get human-readable description
- `formatPermissionName()` - Format for display
- `isSystemPermission()` - Check if system-level permission

## 🔧 Updated Pages with Permission Checks

### 1. Incidents Page (`apps/web/app/dashboard/(uptime)/incidents/page.tsx`)
- ✅ **Create Incident Button**: Requires `incident_management` permission
- ✅ **Analytics Button**: Requires `incident_management` OR `analytics` permission
- ✅ **Disabled State**: Shows disabled button with tooltip when no permission

### 2. Teams Page (`apps/web/app/dashboard/settings/teams/page.tsx`)
- ✅ **Create Team Button**: Requires `team:create` permission
- ✅ **Invite Member Button**: Requires `member:invite` permission  
- ✅ **Create Role Button**: Requires `role:create` permission
- ✅ **Empty States**: Permission-aware empty state buttons

### 3. Monitoring Page (`apps/web/app/dashboard/(uptime)/monitoring/page.tsx`)
- ✅ **Imports Added**: Ready for permission implementation
- ⏳ **Buttons**: Need to be wrapped with PermissionGate (next step)

## 🎯 Permission Mapping

### Core Features and Required Permissions

| Feature | Required Permission | Fallback Behavior |
|---------|-------------------|-------------------|
| Create Incident | `incident_management` | Disabled button with tooltip |
| View Analytics | `analytics` OR `incident_management` | Disabled button |
| Create Team | `team:create` | Disabled button |
| Edit Team | `team:edit` | Hide edit options |
| Delete Team | `team:delete` | Hide delete options |
| Invite Member | `member:invite` | Disabled button |
| Create Role | `role:create` | Disabled button |
| Create Monitor | `monitor:create` | Disabled button |
| Edit Monitor | `monitor:edit` | Hide edit options |
| Delete Monitor | `monitor:delete` | Hide delete options |

## 🚀 Usage Examples

### Basic Permission Check
```tsx
import { PermissionGate } from '@/components/permissions/PermissionGate';
import { TEAM_PERMISSIONS } from '@/lib/permissions';

<PermissionGate permission={TEAM_PERMISSIONS.CREATE}>
  <CreateTeamButton />
</PermissionGate>
```

### Multiple Permissions (OR Logic)
```tsx
<PermissionGate 
  permissions={[SYSTEM_PERMISSIONS.ANALYTICS, SYSTEM_PERMISSIONS.REPORTING]}
  fallback={<div>No access to analytics</div>}
>
  <AnalyticsDashboard />
</PermissionGate>
```

### Multiple Permissions (AND Logic)
```tsx
<PermissionGate 
  permissions={['team:create', 'team:edit']}
  requireAll={true}
  fallback={<PermissionAlert requiredPermissions={['team:create', 'team:edit']} />}
>
  <AdvancedTeamManagement />
</PermissionGate>
```

### Using Permission Hook Directly
```tsx
import { usePermissions } from '@/hooks/usePermissions';
import { MONITOR_PERMISSIONS } from '@/lib/permissions';

function MonitorActions() {
  const { hasPermission, isAdmin } = usePermissions();
  
  if (isAdmin()) {
    return <AdminMonitorControls />;
  }
  
  return (
    <div>
      {hasPermission(MONITOR_PERMISSIONS.CREATE) && <CreateButton />}
      {hasPermission(MONITOR_PERMISSIONS.EDIT) && <EditButton />}
      {hasPermission(MONITOR_PERMISSIONS.DELETE) && <DeleteButton />}
    </div>
  );
}
```

## ⚠️ Important Notes

### Admin Users
- **Admin role bypasses all permission checks**
- Admin users see all UI elements and can perform all actions
- This is handled automatically in all components

### Graceful Degradation
- **Never break the UI** when permissions are missing
- Always provide fallback content (disabled buttons, explanatory text)
- Use tooltips to explain why features are disabled

### Performance
- Permission checks are lightweight (Redux state lookup)
- No API calls needed for UI permission checks
- Components re-render automatically when permissions change

## 🔄 Next Steps to Complete Implementation

### 1. Remaining Pages to Update
- [ ] **Monitoring Page**: Add permission checks to create/edit/delete monitor buttons
- [ ] **Integrations Page**: Add permission checks for integration management
- [ ] **Status Pages**: Add permission checks for status page management
- [ ] **Escalation Policies**: Add permission checks for policy management
- [ ] **Settings Pages**: Add permission checks for various settings

### 2. Advanced Features
- [ ] **Permission-based Navigation**: Hide sidebar items user can't access
- [ ] **Bulk Operations**: Permission checks for bulk actions
- [ ] **Context Menus**: Permission-aware dropdown menus
- [ ] **Form Fields**: Disable form fields based on permissions

### 3. User Experience Improvements
- [ ] **Permission Dashboard**: Show user their current permissions
- [ ] **Permission Requests**: Allow users to request additional permissions
- [ ] **Better Error Messages**: More specific permission error messages
- [ ] **Loading States**: Permission-aware loading states

## 🧪 Testing Permission System

### Manual Testing Checklist
1. **Create test users with different roles**
2. **Verify buttons are disabled/hidden appropriately**
3. **Check tooltips show correct permission messages**
4. **Test API calls still return 403 when bypassing UI**
5. **Verify admin users can access everything**

### Test Scenarios
- ✅ User with no permissions sees disabled buttons
- ✅ User with partial permissions sees mixed UI
- ✅ Admin user sees all features enabled
- ✅ Permission changes reflect immediately in UI
- ✅ API still enforces permissions even if UI is bypassed

## 📝 Summary

The permission system now provides:

1. **Complete Backend Protection** - All API endpoints check permissions
2. **User-Friendly Frontend** - Users only see what they can use
3. **Clear Feedback** - Disabled states with explanatory tooltips
4. **Maintainable Code** - Reusable components and constants
5. **Admin Override** - Admins bypass all restrictions
6. **Graceful Degradation** - Never breaks the user experience

**Result**: Users now get clear visual feedback about their permissions and won't be frustrated by clicking buttons that result in 403 errors.