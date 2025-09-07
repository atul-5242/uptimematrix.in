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

  // 3️⃣ Seed Default Escalation Policy (linked with defaultUser)
  const defaultPolicy = await prismaClient.escalationPolicy.upsert({
    where: { name_userId: { name: "Default Escalation Policy", userId: defaultUser.id } },
    update: {},
    create: {
      name: "Default Escalation Policy",
      description: "Default policy for handling website alerts",
      priorityLevel: "low",
      tags: ["default", "policy"],
      isActive: true,

      monitorsDown: true,
      responseTimeThreshold: false,
      responseTimeValue: 5000,
      sslExpiry: false,
      sslExpiryDays: 30,
      domainExpiry: false,
      domainExpiryDays: 30,
      statusCodeErrors: false,
      statusCodes: [],
      heartbeatMissed: false,
      heartbeatMissedCount: 3,

      userId: defaultUser.id,
      steps: {
        create: [
          {
            stepOrder: 1,
            primaryMethods: ["email"],
            additionalMethods: [],
            recipients: ["default-admin@example.com"],
            delayMinutes: 0,
            escalateAfter: 0,
            customMessage: "⚠️ Default Alert: Please check the website status.",
          },
        ],
      },
    },
    include: { steps: true },
  });

  console.log("✅ Default Escalation Policy seeded successfully:", defaultPolicy);
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
