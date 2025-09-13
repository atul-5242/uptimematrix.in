# Team Member Flow Integration Guide

This document provides a comprehensive guide for integrating the complete team member management system into your BetterStack-like uptime monitoring application.

## Overview

The team member flow includes:
- ✅ Complete API endpoints for team and member management
- ✅ Frontend components for team member operations
- ✅ Role-based permission system
- ✅ Member invitation system
- ✅ Real-time team member management

## Files Created/Modified

### Backend API Layer

#### Controllers
- `apps/api/controllers/teamsSectionController.ts` - Complete team management controller with all CRUD operations

#### Routes
- `apps/api/routes/team-sectionRoutes/team/teamRoutes.ts` - Team management routes
- `apps/api/routes/team-sectionRoutes/members/memberRoutes.ts` - Member management routes  
- `apps/api/routes/team-sectionRoutes/roles/roleRoutes.ts` - Role management routes

### Frontend API Layer

#### Next.js API Routes
- `apps/web/app/api/team-section/team/route.ts` - Team CRUD operations
- `apps/web/app/api/team-section/team/[teamId]/route.ts` - Individual team operations
- `apps/web/app/api/team-section/members/route.ts` - Member operations
- `apps/web/app/api/team-section/members/[teamId]/[memberId]/route.ts` - Individual member operations
- `apps/web/app/api/team-section/roles/route.ts` - Role fetching

#### Server Actions
- `apps/web/app/all-actions/team-section/team/actions.ts` - Team management actions
- `apps/web/app/all-actions/team-section/members/actions.ts` - Member management actions
- `apps/web/app/all-actions/team-section/roles/actions.ts` - Role management actions

### Frontend Components

#### Team Management Components
- `apps/web/app/components/teams/EnhancedTeamsPage.tsx` - Main teams page with full functionality
- `apps/web/app/components/teams/TeamMemberModal.tsx` - Add existing members to teams
- `apps/web/app/components/teams/InviteMemberModal.tsx` - Invite new members to organization/teams
- `apps/web/app/components/teams/MemberManagementCard.tsx` - Individual member management card

### Database & Permissions

#### Seeding Script
- `scripts/seed-roles-permissions.js` - Seeds default roles and permissions

## Integration Steps

### 1. Database Setup

First, run the seeding script to create roles and permissions:

```bash
cd packages/store
node ../../scripts/seed-roles-permissions.js
```

This creates:
- **Admin**: Full access to all features
- **Billing Admin**: Billing and reporting access
- **Team Lead**: Team management and monitoring
- **Responder**: Incident response and monitoring
- **Member**: Basic viewing permissions

### 2. Backend Integration

Add the team routes to your main API router:

```typescript
// In your main API app file (e.g., apps/api/index.ts)
import teamRoutes from './routes/team-sectionRoutes/team/teamRoutes';
import memberRoutes from './routes/team-sectionRoutes/members/memberRoutes';
import roleRoutes from './routes/team-sectionRoutes/roles/roleRoutes';

app.use('/api/teams', teamRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/roles', roleRoutes);
```

### 3. Frontend Integration

Replace the existing teams page with the enhanced version:

```typescript
// In apps/web/app/dashboard/settings/teams/page.tsx
import EnhancedTeamsPage from '@/app/components/teams/EnhancedTeamsPage';

export default function TeamsPage() {
  return <EnhancedTeamsPage />;
}
```

### 4. Environment Variables

Ensure these environment variables are set:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# JWT Secret for authentication
JWT_SECRET=your-jwt-secret

# Database URL
DATABASE_URL=your-database-url
```

## API Endpoints

### Team Management
- `GET /api/teams` - Get all teams for organization
- `POST /api/teams` - Create new team
- `PUT /api/teams/:teamId` - Update team
- `DELETE /api/teams/:teamId` - Delete team

### Member Management
- `GET /api/teams/:teamId/members` - Get team members
- `POST /api/teams/:teamId/members` - Add member to team
- `PUT /api/teams/:teamId/members/:memberId` - Update team member
- `DELETE /api/teams/:teamId/members/:memberId` - Remove member from team
- `GET /api/teams/:teamId/available-users` - Get available users for team

### Utility Endpoints
- `GET /api/teams/roles` - Get all available roles

## Features Implemented

### ✅ Team Management
- Create, edit, and delete teams
- Team descriptions and metadata
- Team member count tracking
- Expandable team views

### ✅ Member Management
- Add existing organization members to teams
- Remove members from teams
- Update member roles within teams
- Team lead designation
- Member status tracking (active, pending, inactive)

### ✅ Invitation System
- Invite new members to organization
- Automatically add to teams during invitation
- Custom invitation messages
- Role assignment during invitation

### ✅ Role-Based Permissions
- Predefined roles (Admin, Team Lead, Responder, etc.)
- Granular permissions system
- Permission-based UI controls
- Role descriptions and permission lists

### ✅ User Experience
- Responsive design for all screen sizes
- Loading states and error handling
- Confirmation dialogs for destructive actions
- Toast notifications for user feedback
- Search and filter capabilities

## Permission System

The system includes these key permissions:

### Team Permissions
- `team:create` - Create new teams
- `team:edit` - Edit team settings
- `team:delete` - Delete teams
- `team:add_member` - Add members to teams
- `team:remove_member` - Remove members from teams
- `team:view` - View team information

### Member Permissions
- `member:invite` - Invite new members
- `member:edit` - Edit member information
- `member:remove` - Remove members
- `member:view` - View member information

### Organization Permissions
- `organization:manage_members` - Manage organization members
- `role:assign` - Assign roles to members

## Security Features

### ✅ Authentication & Authorization
- JWT token validation on all endpoints
- Organization-scoped operations
- Permission-based access control
- User context validation

### ✅ Data Validation
- Input sanitization and validation
- Email format validation
- Required field validation
- Duplicate prevention (team names, member emails)

### ✅ Error Handling
- Comprehensive error messages
- Graceful failure handling
- User-friendly error displays
- Network error recovery

## Usage Examples

### Creating a Team
```typescript
const result = await createTeam({
  name: "Engineering Team",
  description: "Core development team"
});
```

### Adding Members to Team
```typescript
const result = await addMemberToTeam(teamId, {
  userId: "user-id",
  roleId: "role-id",
  isTeamLead: false
});
```

### Inviting New Members
```typescript
const result = await inviteMemberToOrganization({
  name: "John Doe",
  email: "john@example.com",
  roleId: "responder-role-id",
  teamId: "optional-team-id"
});
```

## Next Steps

1. **Test the Integration**: Use the provided components and verify all functionality
2. **Customize Styling**: Adjust the UI components to match your design system
3. **Add Notifications**: Integrate with your notification system for member invitations
4. **Extend Permissions**: Add more granular permissions as needed
5. **Add Analytics**: Track team and member metrics

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Ensure JWT tokens are properly configured
2. **Permission Denied**: Check user roles and permissions in database
3. **API Connection**: Verify API_BASE_URL environment variable
4. **Database Errors**: Ensure Prisma schema is up to date

### Debug Tips

1. Check browser console for frontend errors
2. Check API server logs for backend errors
3. Verify database connections and migrations
4. Test API endpoints directly with tools like Postman

## Support

The team member flow is now fully integrated and ready for use. All components are designed to work together seamlessly and provide a complete team management experience similar to BetterStack's organization structure.
