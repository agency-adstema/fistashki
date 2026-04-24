#!/bin/bash
TOKEN=$(curl -s -X POST http://localhost:4000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"Admin123!"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['accessToken'])")

echo "Token: ${TOKEN:0:30}..."

# Get first pending order
ORDER_ID=$(psql "$DATABASE_URL" -t -c "SELECT id FROM orders WHERE status='PENDING' LIMIT 1;" 2>/dev/null | tr -d ' ')
echo "Order ID: $ORDER_ID"

# Test schedule call
RESULT=$(curl -s -X POST "http://localhost:4000/api/v1/calls/schedule/$ORDER_ID" \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"delaySeconds":10}')
echo "Schedule result: $RESULT"
