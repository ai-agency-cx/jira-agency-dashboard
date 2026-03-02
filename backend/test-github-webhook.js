#!/usr/bin/env node

/**
 * Test script for GitHub webhook integration
 * Simulates GitHub webhook events for testing
 */

const crypto = require('crypto');

// Configuration
const WEBHOOK_URL = 'http://localhost:3000/api/github/webhook';
const SECRET = 'development-secret-change-in-production';

// Generate HMAC signature
function generateSignature(payload) {
  const hmac = crypto.createHmac('sha256', SECRET);
  return 'sha256=' + hmac.update(JSON.stringify(payload)).digest('hex');
}

// Test payloads
const testPayloads = {
  pr_merged: {
    action: 'closed',
    pull_request: {
      number: 2,
      title: 'Phase 2 - Custom icons, newsletter, search & social',
      state: 'closed',
      merged: true,
      merged_at: new Date().toISOString()
    },
    repository: {
      name: 'infralyze-consulting',
      full_name: 'ai-agency-cx/infralyze-consulting'
    }
  },
  
  pr_opened: {
    action: 'opened',
    pull_request: {
      number: 5,
      title: 'Security & performance optimization',
      state: 'open',
      merged: false
    },
    repository: {
      name: 'infralyze-consulting',
      full_name: 'ai-agency-cx/infralyze-consulting'
    }
  },
  
  issue_opened: {
    action: 'opened',
    issue: {
      number: 10,
      title: 'Add dark mode support',
      body: 'Users have requested dark mode for better night-time usage.',
      assignee: {
        login: '@dev'
      },
      labels: [
        { name: 'enhancement' },
        { name: 'ui' }
      ]
    },
    repository: {
      name: 'infralyze-consulting',
      full_name: 'ai-agency-cx/infralyze-consulting'
    }
  }
};

// Send test webhook
async function sendTestWebhook(eventType, payload) {
  console.log(`\n📤 Sending ${eventType} webhook...`);
  
  const signature = generateSignature(payload);
  
  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-GitHub-Event': eventType === 'issue_opened' ? 'issues' : 'pull_request',
      'X-Hub-Signature-256': signature
    },
    body: JSON.stringify(payload)
  });
  
  const result = await response.json();
  
  console.log(`✅ Response: ${response.status} ${response.statusText}`);
  console.log(`📊 Result:`, result);
  
  return result;
}

// Main test function
async function runTests() {
  console.log('🧪 GitHub Webhook Integration Tests');
  console.log('===================================\n');
  
  console.log('🔧 Configuration:');
  console.log(`   Webhook URL: ${WEBHOOK_URL}`);
  console.log(`   Secret configured: ${SECRET !== 'development-secret-change-in-production' ? '✅' : '⚠️ (using default)'}`);
  console.log('');
  
  // Test 1: PR merged event (should move card to "done")
  console.log('🧪 Test 1: PR Merged Event');
  console.log('   Expected: Card ID 6 moves to "done" status');
  await sendTestWebhook('pr_merged', testPayloads.pr_merged);
  
  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 2: New PR opened (should move card to "progress")
  console.log('\n🧪 Test 2: New PR Opened');
  console.log('   Expected: New card created or existing card moved to "progress"');
  await sendTestWebhook('pr_opened', testPayloads.pr_opened);
  
  // Wait for processing
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Test 3: New issue opened (should create Kanban card)
  console.log('\n🧪 Test 3: New Issue Opened');
  console.log('   Expected: New Kanban card created in "backlog"');
  await sendTestWebhook('issue_opened', testPayloads.issue_opened);
  
  console.log('\n✅ All tests completed!');
  console.log('\n📋 Expected Results:');
  console.log('   1. Card ID 6 (Phase 2 features) → "done" status');
  console.log('   2. Activity log shows GitHub events');
  console.log('   3. WebSocket clients receive real-time updates');
  console.log('   4. Database updated with new status');
  
  console.log('\n🔍 To verify:');
  console.log('   - Check backend logs for "GitHub webhook received"');
  console.log('   - Check database: SELECT * FROM tasks WHERE id = 6');
  console.log('   - Check activity: SELECT * FROM activity_log ORDER BY id DESC LIMIT 5');
}

// Run tests if this script is executed directly
if (require.main === module) {
  // Check if fetch is available (Node 18+)
  if (typeof fetch !== 'function') {
    console.error('❌ Node.js 18+ required for fetch API');
    console.log('💡 Run with: node --experimental-fetch test-github-webhook.js');
    process.exit(1);
  }
  
  runTests().catch(console.error);
}

module.exports = { sendTestWebhook, testPayloads };