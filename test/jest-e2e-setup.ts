import { execSync } from 'node:child_process';

export default async function globalSetup() {
  // Ensure database schema is applied before e2e tests.
  // Requires DATABASE_URL to point to a reachable Postgres database.
  execSync('npx prisma migrate deploy', { stdio: 'inherit' });
}

