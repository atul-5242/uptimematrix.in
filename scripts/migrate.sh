#!/bin/bash
set -e
echo "Running migrations..."
bun run prisma migrate deploy --schema packages/store/prisma/schema.prisma # or knex migrate:latest / sequelize db:migrate etc.
