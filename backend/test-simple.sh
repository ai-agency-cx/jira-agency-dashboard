#!/bin/bash

echo "🧪 Simple GitHub Webhook Test (No Signature)"
echo "============================================"
echo ""

# Test PR merged event
echo "📤 Sending PR merged webhook (no signature)..."
curl -X POST "http://localhost:3000/api/github/webhook" \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: pull_request" \
  -d '{
    "action": "closed",
    "pull_request": {
      "number": 2,
      "title": "Phase 2 - Custom icons, newsletter, search & social",
      "state": "closed",
      "merged": true,
      "merged_at": "'$(date -Iseconds)'"
    },
    "repository": {
      "name": "infralyze-consulting",
      "full_name": "ai-agency-cx/infralyze-consulting"
    }
  }'

echo ""
echo ""
sleep 1

# Check database
echo "🔍 Checking database..."
sqlite3 kanban.db "SELECT id, title, status FROM tasks WHERE id = 6;"
echo ""
echo "📊 Recent activity..."
sqlite3 kanban.db "SELECT id, action, entity_id, timestamp FROM activity_log ORDER BY id DESC LIMIT 3;"