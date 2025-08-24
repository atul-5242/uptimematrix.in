Write-Host "Running migrations on Windows..."
pnpm exec prisma migrate deploy --schema packages/store/prisma/schema.prisma  # or knex migrate:latest / sequelize db:migrate
