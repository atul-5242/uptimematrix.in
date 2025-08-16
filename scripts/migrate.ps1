Write-Host "Running migrations on Windows..."
bun run prisma migrate deploy --schema packages/store/prisma/schema.prisma  # or knex migrate:latest / sequelize db:migrate
