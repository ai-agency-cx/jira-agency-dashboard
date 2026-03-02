#!/bin/bash

echo "🧪 GitHub Webhook Integration Test"
echo "=================================="
echo ""

# Configuration
WEBHOOK_URL="http://localhost:3000/api/github/webhook"
SECRET="development-secret-change-in-production"

# Generate HMAC signature
generate_signature() {
  local payload="$1"
  echo -n "$payload" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print "sha256="$2}'
}

# Test 1: PR merged event
echo "🧪 Test 1: PR Merged Event"
echo "   Expected: Card ID 6 moves to 'done' status"
echo ""

PR_MERGED_PAYLOAD='{
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

SIGNATURE=$(generate_signature "$PR_MERGED_PAYLOAD")

echo "📤 Sending PR merged webhook..."
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: pull_request" \
  -H "X-Hub-Signature-256: $SIGNATURE" \
  -d "$PR_MERGED_PAYLOAD"

echo ""
echo ""
sleep 1

# Test 2: New issue opened
echo "🧪 Test 2: New Issue Opened"
echo "   Expected: New Kanban card created in 'backlog'"
echo ""

ISSUE_PAYLOAD='{
  "action": "opened",
  "issue": {
    "number": 10,
    "title": "Add dark mode support",
    "body": "Users have requested dark mode for better night-time usage.",
    "assignee": {
      "login": "@dev"
    },
    "labels": [
      { "name": "enhancement" },
      { "name": "ui" }
    ]
  },
  "repository": {
    "name": "infralyze-consulting",
    "full_name": "ai-agency-cx/infralyze-consulting"
  }
}'

SIGNATURE=$(generate_signature "$ISSUE_PAYLOAD")

echo "📤 Sending issue opened webhook..."
curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: application/json" \
  -H "X-GitHub-Event: issues" \
  -H "X-Hub-Signature-256: $SIGNATURE" \
  -d "$ISSUE_PAYLOAD"

echo ""
echo ""
echo "✅ Test webhooks sent!"
echo ""
echo "📋 Expected Results:"
echo "   1. Card ID 6 (Phase 2 features) → 'done' status"
echo "   2. New Kanban card created for issue #10"
echo "   3. Activity log shows GitHub events"
echo "   4. WebSocket clients receive real-time updates"
echo ""
echo "🔍 Check backend logs for:"
echo "   - 'GitHub webhook received: pull_request'"
echo "   - 'GitHub webhook received: issues'"
echo "   - 'Updating Kanban card 6 to done'"
echo ""
echo "📊 Verify database updates:"
echo "   sqlite3 kanban.db 'SELECT id, title, status FROM tasks WHERE id = 6'"
echo "   sqlite3 kanban.db 'SELECT * FROM activity_log ORDER BY id DESC LIMIT 3'"