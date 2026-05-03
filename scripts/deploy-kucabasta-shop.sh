#!/usr/bin/env bash
# Deploy Vite dist → Kuća Bašta VPS (shop only). Run from repo root AFTER: cd green-roots-emporium && npm run build
set -euo pipefail
SERVER="${KUCABA_SERVER:-root@146.190.225.1}"
REMOTE_DIST="${KUCABA_REMOTE_DIST:-/opt/green-roots/repo/dist}"
LOCAL_DIST="${KUCABA_LOCAL_DIST:-green-roots-emporium/dist}"

if [[ ! -d "$LOCAL_DIST" ]]; then
  echo "Missing $LOCAL_DIST — run: (cd green-roots-emporium && npm run build)" >&2
  exit 1
fi

TS="$(date +%Y%m%d%H%M%S)"
echo "=== rsync $LOCAL_DIST → $SERVER:$REMOTE_DIST ==="
rsync -avz --delete "$LOCAL_DIST/" "$SERVER:$REMOTE_DIST/"

echo "=== Done. Nginx root should be $REMOTE_DIST (see /etc/nginx/sites-enabled/kucabasta.rs) ==="
