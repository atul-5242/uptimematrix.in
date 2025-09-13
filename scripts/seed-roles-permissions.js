const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const permissions = [
  // Organization Permissions
  { name: 'organization:create', description: 'Create new organizations' },
  { name: 'organization:edit', description: 'Edit organization settings' },
  { name: 'organization:delete', description: 'Delete organizations' },
  { name: 'organization:manage_members', description: 'Manage organization members' },
  
  // Team Management Permissions
  { name: 'team:create', description: 'Create new teams' },
  { name: 'team:edit', description: 'Edit team settings' },
  { name: 'team:delete', description: 'Delete teams' },
  { name: 'team:add_member', description: 'Add members to teams' },
  { name: 'team:remove_member', description: 'Remove members from teams' },
  { name: 'team:view', description: 'View team information' },
  
  // Member Management Permissions
  { name: 'member:invite', description: 'Invite new members' },
  { name: 'member:edit', description: 'Edit member information' },
  { name: 'member:remove', description: 'Remove members' },
  { name: 'member:view', description: 'View member information' },
  
  // Role Management Permissions
  { name: 'role:create', description: 'Create custom roles' },
  { name: 'role:edit', description: 'Edit role permissions' },
  { name: 'role:delete', description: 'Delete custom roles' },
  { name: 'role:assign', description: 'Assign roles to members' },
  
  // Monitoring Permissions
  { name: 'monitor:create', description: 'Create new monitors' },
  { name: 'monitor:edit', description: 'Edit monitor settings' },
  { name: 'monitor:delete', description: 'Delete monitors' },
  { name: 'monitor:view', description: 'View monitor data' },
  
  // Escalation Policy Permissions
  { name: 'escalation_policy:create', description: 'Create escalation policies' },
  { name: 'escalation_policy:edit', description: 'Edit escalation policies' },
  { name: 'escalation_policy:delete', description: 'Delete escalation policies' },
  
  // Integration Permissions
  { name: 'integration:create', description: 'Create integrations' },
  { name: 'integration:edit', description: 'Edit integrations' },
  { name: 'integration:delete', description: 'Delete integrations' },
  
  // Status Page Permissions
  { name: 'status_page:create', description: 'Create status pages' },
  { name: 'status_page:edit', description: 'Edit status pages' },
  { name: 'status_page:delete', description: 'Delete status pages' },
  
  // Incident Management Permissions
  { name: 'incident:create', description: 'Create incidents' },
  { name: 'incident:edit', description: 'Edit incident details' },
  { name: 'incident:resolve', description: 'Resolve incidents' },
  { name: 'incident:acknowledge', description: 'Acknowledge incidents' },
  
  // Billing and Admin Permissions
  { name: 'billing:view', description: 'View billing information' },
  { name: 'billing:edit', description: 'Manage billing and subscriptions' },
  { name: 'reporting:view', description: 'View reports and analytics' },
  { name: 'settings:edit', description: 'Edit organization settings' },
  { name: 'api:access', description: 'Access API endpoints' },
  { name: 'audit:view', description: 'View audit logs' },
];

const roles = [
  {
    name: 'Admin',
    description: 'Full access to all features and settings. Can manage organization, teams, members, and all resources.',
    permissions: [
      'organization:create', 'organization:edit', 'organization:delete', 'organization:manage_members',
      'team:create', 'team:edit', 'team:delete', 'team:add_member', 'team:remove_member', 'team:view',
      'member:invite', 'member:edit', 'member:remove', 'member:view',
      'role:create', 'role:edit', 'role:delete', 'role:assign',
      'monitor:create', 'monitor:edit', 'monitor:delete', 'monitor:view',
      'escalation_policy:create', 'escalation_policy:edit', 'escalation_policy:delete',
      'integration:create', 'integration:edit', 'integration:delete',
      'status_page:create', 'status_page:edit', 'status_page:delete',
      'incident:create', 'incident:edit', 'incident:resolve', 'incident:acknowledge',
      'billing:view', 'billing:edit', 'reporting:view', 'settings:edit', 'api:access', 'audit:view'
    ]
  },
  {
    name: 'Billing Admin',
    description: 'Can manage billing and view reports. Limited access to other features.',
    permissions: [
      'billing:view', 'billing:edit', 'reporting:view', 'member:view', 'team:view'
    ]
  },
  {
    name: 'Team Lead',
    description: 'Can manage teams and team members. Can create and manage monitors and incidents.',
    permissions: [
      'team:create', 'team:edit', 'team:add_member', 'team:remove_member', 'team:view',
      'member:invite', 'member:view', 'role:assign',
      'monitor:create', 'monitor:edit', 'monitor:delete', 'monitor:view',
      'escalation_policy:create', 'escalation_policy:edit', 'escalation_policy:delete',
      'integration:create', 'integration:edit', 'integration:delete',
      'status_page:create', 'status_page:edit', 'status_page:delete',
      'incident:create', 'incident:edit', 'incident:resolve', 'incident:acknowledge',
      'billing:view', 'reporting:view', 'api:access'
    ]
  },
  {
    name: 'Responder',
    description: 'Can respond to incidents and manage monitors. Can view team information.',
    permissions: [
      'team:view', 'member:view',
      'monitor:create', 'monitor:edit', 'monitor:view',
      'incident:create', 'incident:edit', 'incident:resolve', 'incident:acknowledge',
      'escalation_policy:view', 'integration:view', 'status_page:edit',
      'billing:view', 'reporting:view'
    ]
  },
  {
    name: 'Member',
    description: 'Basic access to view information and limited monitoring capabilities.',
    permissions: [
      'team:view', 'member:view',
      'monitor:view', 'incident:view', 'status_page:view',
      'billing:view', 'reporting:view'
    ]
  }
];

async function seedRolesAndPermissions() {
  try {
    console.log('🌱 Starting to seed roles and permissions...');

    // Create permissions
    console.log('Creating permissions...');
    for (const permission of permissions) {
      await prisma.permission.upsert({
        where: { name: permission.name },
        update: { description: permission.description },
        create: permission
      });
    }
    console.log(`✅ Created ${permissions.length} permissions`);

    // Create roles with permissions
    console.log('Creating roles...');
    for (const roleData of roles) {
      // First, create or update the role
      const role = await prisma.role.upsert({
        where: { name: roleData.name },
        update: { description: roleData.description },
        create: {
          name: roleData.name,
          description: roleData.description
        }
      });

      // Then, connect permissions
      const permissionIds = await prisma.permission.findMany({
        where: {
          name: { in: roleData.permissions }
        },
        select: { id: true }
      });

      await prisma.role.update({
        where: { id: role.id },
        data: {
          permissions: {
            set: permissionIds
          }
        }
      });

      console.log(`✅ Created role: ${roleData.name} with ${roleData.permissions.length} permissions`);
    }

    console.log('🎉 Successfully seeded roles and permissions!');
  } catch (error) {
    console.error('❌ Error seeding roles and permissions:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding function
seedRolesAndPermissions()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
