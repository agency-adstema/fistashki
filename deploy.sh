#!/usr/bin/env bash
set -euo pipefail

# Na serveru: export DEPLOY_BRANCH=moja-grana   (podrazumevano main)
BRANCH="${DEPLOY_BRANCH:-main}"
APP_DIR="${DEPLOY_APP_DIR:-/var/www/adstema-backend}"

cd "$APP_DIR"
echo "=== Directory ==="
pwd
echo "=== Git pull ($BRANCH) ==="
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"
echo "=== Prisma migrate ==="
npx prisma migrate deploy
echo "=== npm build ==="
# Potrebni su devDependencies (@nestjs/cli, typescript) za nest build
npm ci || npm install
npm run build
echo "=== PM2 ==="
pm2 restart backend
pm2 status
