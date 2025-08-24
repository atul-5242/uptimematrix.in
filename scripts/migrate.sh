#!/bin/bash
set -e
echo "Running migrations..."
pnpm exec prisma migrate deploy --schema packages/store/prisma/schema.prisma # or knex migrate:latest / sequelize db:migrate etc.
