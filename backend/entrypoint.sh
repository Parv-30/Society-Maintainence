#!/bin/sh
set -e

echo "Running Prisma migrations..."
npx prisma migrate deploy

echo "Running seed..."
node prisma/seed.js || echo "Seed already ran or failed (skipping)"

echo "Starting server..."
exec npm run dev
