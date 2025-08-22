import {prismaClient} from './../index.js';
async function main() {
    const regions = ['1','India', 'Europe', 'North America', 'South America', 'Africa', 'Australia'];
  
    for (const name of regions) {
      await prismaClient.region.upsert({
        where: { name },
        update: {},
        create: { name },
      });
    }
  
    console.log('✅ Regions seeded successfully');
  }
  
main()
  .catch((e) => {
    console.error('❌ Error seeding regions:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
});