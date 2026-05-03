#!/usr/bin/env bash
# Deploy agency-adstema/fistashki main â†’ PM2 app dir on VPS (run ON server as root).
set -euo pipefail
APP="${DEPLOY_APP_DIR:-/var/www/adstema-admin/server}"
REPO_URL="${FISTASHKI_REPO_URL:-https://github.com/agency-adstema/fistashki.git}"
BRANCH="${DEPLOY_BRANCH:-main}"
TMP="$(mktemp -d /tmp/fistashki-deploy.XXXXXX)"
cleanup() { rm -rf "$TMP"; }
trap cleanup EXIT

echo "=== Clone $REPO_URL ($BRANCH) â†’ $TMP ==="
git clone --depth 1 -b "$BRANCH" "$REPO_URL" "$TMP/SRC"

echo "=== Sanity: blog image service ==="
test -f "$TMP/SRC/src/modules/blog/services/blog-image.service.ts"
test -f "$TMP/SRC/src/modules/seo/services/seo-commerce-content.service.ts"

echo "=== Backup .env ==="
ENV_BAK="/tmp/server-env.backup.$$"
if [[ -f "$APP/.env" ]]; then cp "$APP/.env" "$ENV_BAK"; fi

echo "=== Rsync into $APP (--delete: ukloni stare fajlove iz drugog repoa; Äuva uploads/.env) ==="
rsync -a --delete "$TMP/SRC/" "$APP/" \
  --exclude node_modules \
  --exclude .git \
  --exclude dist \
  --exclude uploads \
  --exclude .env

if [[ -f "$ENV_BAK" ]]; then mv "$ENV_BAK" "$APP/.env"; fi

cd "$APP"
echo "=== Dependencies ==="
npm ci || npm install
echo "=== Prisma ==="
npx prisma migrate deploy
echo "=== Build ==="
export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=4096}"
npm run build
echo "=== PM2 ==="
pm2 restart backend
pm2 status backend

echo "=== Done ==="
