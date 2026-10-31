#!/usr/bin/env bash
set -euo pipefail

# Gandras Spot remote install — gandraspot.rs ONLY.
# Does NOT touch lamena.io (now MojTermin), mojtermin*, crm.adstema.com, api.adstema.com.

WEB_DIR="${GANDRAS_WEB_DIR:-/var/www/gandras-spot-web}"
API_DIR="${GANDRAS_API_DIR:-/var/www/gandras-spot-api}"
WEB_PORT="${GANDRAS_WEB_PORT:-6596}"
API_PORT="${GANDRAS_API_PORT:-4100}"
PM2_WEB="${GANDRAS_PM2_WEB:-gandras-spot-web}"
PM2_API="${GANDRAS_PM2_API:-gandras-spot-api}"

mkdir -p "$WEB_DIR" "$API_DIR/uploads" "$API_DIR/uploads/menu"
rm -rf "${WEB_DIR:?}"/*
tar -xzf /tmp/deploy-gandras-web.tgz -C "$WEB_DIR"
rm -f /tmp/deploy-gandras-web.tgz
chmod -R a+rX "$WEB_DIR"

cd "$API_DIR"
tar -xzf /tmp/deploy-gandras-api.tgz
rm -f /tmp/deploy-gandras-api.tgz
if [ -f /tmp/gandras-spot-api.env ]; then
  mv /tmp/gandras-spot-api.env "$API_DIR/.env"
fi
if [ -f "$API_DIR/.env" ]; then
  if grep -q '^PORT=' "$API_DIR/.env"; then
    sed -i "s/^PORT=.*/PORT=${API_PORT}/" "$API_DIR/.env"
  else
    echo "PORT=${API_PORT}" >> "$API_DIR/.env"
  fi
  if grep -q '^CORS_ORIGIN=' "$API_DIR/.env"; then
    sed -i 's|^CORS_ORIGIN=.*|CORS_ORIGIN=https://gandraspot.rs,https://www.gandraspot.rs,https://admin.gandraspot.rs|' "$API_DIR/.env"
  else
    echo 'CORS_ORIGIN=https://gandraspot.rs,https://www.gandraspot.rs,https://admin.gandraspot.rs' >> "$API_DIR/.env"
  fi
else
  echo "WARN: missing $API_DIR/.env (DATABASE_URL, JWT_SECRET)"
fi

npm ci --omit=dev
npx prisma generate
timeout 90 npx prisma db push --skip-generate 2>/dev/null || node scripts/migrate-courier-portal.js || echo "WARN: schema sync skipped"

pm2 delete "$PM2_API" 2>/dev/null || true
pm2 delete "$PM2_WEB" 2>/dev/null || true

cd "$API_DIR"
PORT="$API_PORT" pm2 start dist/src/main.js --name "$PM2_API" --cwd "$API_DIR"
cd "$WEB_DIR/app"
HOSTNAME=127.0.0.1 PORT="$WEB_PORT" pm2 start server.js --name "$PM2_WEB"
pm2 save

# Only Gandras domains — never overwrite lamena.io / MojTermin
if [ -f /tmp/nginx-gandras-gandraspot.rs.conf ]; then
  cp /tmp/nginx-gandras-gandraspot.rs.conf /etc/nginx/sites-available/gandraspot.rs
  sed -i 's/\r$//' /etc/nginx/sites-available/gandraspot.rs
  ln -sf /etc/nginx/sites-available/gandraspot.rs /etc/nginx/sites-enabled/gandraspot.rs
fi
if [ -f /tmp/nginx-gandras-admin.gandraspot.rs.conf ]; then
  cp /tmp/nginx-gandras-admin.gandraspot.rs.conf /etc/nginx/sites-available/admin.gandraspot.rs
  sed -i 's/\r$//' /etc/nginx/sites-available/admin.gandraspot.rs
  ln -sf /etc/nginx/sites-available/admin.gandraspot.rs /etc/nginx/sites-enabled/admin.gandraspot.rs
elif [ -f /tmp/nginx-gandras-admin.gandraspot.rs.http.conf ]; then
  cp /tmp/nginx-gandras-admin.gandraspot.rs.http.conf /etc/nginx/sites-available/admin.gandraspot.rs
  sed -i 's/\r$//' /etc/nginx/sites-available/admin.gandraspot.rs
  ln -sf /etc/nginx/sites-available/admin.gandraspot.rs /etc/nginx/sites-enabled/admin.gandraspot.rs
fi

nginx -t && systemctl reload nginx
pm2 restart "$PM2_API" --update-env || true

echo "=== PM2 gandras (lamena.io untouched) ==="
pm2 list | grep gandras || true
curl -s -o /dev/null -w "web:%{http_code}\n" "http://127.0.0.1:${WEB_PORT}/" || true
curl -s -o /dev/null -w "api:%{http_code}\n" "http://127.0.0.1:${API_PORT}/api/docs" || true
