#!/bin/bash
# Get token
curl -s -X POST http://localhost:4000/api/v1/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@example.com","password":"Admin123!"}' \
  -o /tmp/auth.json

TOKEN=$(python3 -c "import json; print(json.load(open('/tmp/auth.json'))['data']['accessToken'])")
echo "Token OK: ${TOKEN:0:20}..."

# Test schedule endpoint
echo "Testing schedule endpoint..."
curl -s -X POST "http://localhost:4000/api/v1/calls/schedule/cmo2sswma00029t53rearasuk" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"delaySeconds": 10}'
echo ""
echo "---"

# Test with calls.manage permission check
echo "Checking current routes..."
curl -s "http://localhost:4000/api/v1/calls?page=1&limit=2" \
  -H "Authorization: Bearer $TOKEN" | python3 -c "import json,sys; d=json.load(sys.stdin); print('Calls:', d.get('message'), '| Count:', len(d.get('data',{}).get('data',[]) or d.get('data',[])))"
