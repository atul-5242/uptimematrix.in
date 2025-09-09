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
