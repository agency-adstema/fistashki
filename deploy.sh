#!/bin/bash
cd /var/www/adstema-backend
echo "=== Current Directory ==="
pwd
echo "=== Git Pull ==="
git pull origin feat/dashboard-conversion-rate-metrics 2>&1 || git pull origin main 2>&1
echo "=== Prisma Migration ==="
npx prisma migrate deploy
echo "=== NPM Build ==="
npm run build
echo "=== PM2 Restart ==="
pm2 restart backend
echo "=== PM2 Status ==="
pm2 status