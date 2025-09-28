import { prismaClient } from "../../index.js";

async function main() {
  // 1️⃣ Ensure a default user exists (will be reused everywhere)
  const defaultUser = await prismaClient.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      fullName: "admin",
      email: "admin@example.com",
      password: "admin", // ⚠️ replace with hashed password in production
    },
  });

  console.log("✅ Default user seeded:", defaultUser);

  // 2️⃣ Seed Regions
  const regions = ["India", "Europe", "North America", "South America", "Africa", "Australia"];

  for (const name of regions) {
    await prismaClient.region.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("✅ Regions seeded successfully");

  // 3️⃣ Seed Permissions
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

  for (const permission of permissions) {
    await prismaClient.permission.upsert({
      where: { name: permission.name },
      update: { description: permission.description },
      create: permission
    });
  }

  console.log(`✅ Permissions seeded successfully (${permissions.length} permissions)`);

  // 4️⃣ Seed Roles
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
        'billing:view', 'reporting:view'
      ]
    },
    {
      name: 'Member',
      description: 'Basic access to view information and limited monitoring capabilities.',
      permissions: [
        'team:view', 'member:view',
        'monitor:view', 'billing:view', 'reporting:view'
      ]
    }
  ];

  for (const roleData of roles) {
    // Create or update the role
    const role = await prismaClient.role.upsert({
      where: { name: roleData.name },
      update: { description: roleData.description },
      create: {
        name: roleData.name,
        description: roleData.description
      }
    });

    // Get permission IDs
    const permissionRecords = await prismaClient.permission.findMany({
      where: {
        name: { in: roleData.permissions }
      },
      select: { id: true }
    });

    // Connect permissions to role
    await prismaClient.role.update({
      where: { id: role.id },
      data: {
        permissions: {
          set: permissionRecords
        }
      }
    });

    console.log(`✅ Role seeded: ${roleData.name} with ${roleData.permissions.length} permissions`);
  }

  console.log("✅ Roles seeded successfully");

}

// Run seeding
main()
  .catch((e) => {
    console.error("❌ Error seeding data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
