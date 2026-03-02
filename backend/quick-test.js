const http = require('http');

const data = JSON.stringify({
  action: 'closed',
  pull_request: {
    number: 2,
    title: 'Phase 2 features',
    state: 'closed',
    merged: true,
    merged_at: new Date().toISOString()
  },
  repository: {
    name: 'infralyze-consulting',
    full_name: 'ai-agency-cx/infralyze-consulting'
  }
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/github/webhook',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-GitHub-Event': 'pull_request',
    'Content-Length': data.length
  }
};

console.log('📤 Sending test webhook...');
const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  let responseData = '';
  res.on('data', (chunk) => responseData += chunk);
  res.on('end', () => {
    console.log('Response:', responseData);
    console.log('\n✅ Test completed!');
    console.log('\n🔍 Check backend logs for:');
    console.log('   - "GitHub webhook received: pull_request"');
    console.log('   - "Updating Kanban card 6 to done"');
  });
});

req.on('error', (e) => console.error('Error:', e));
req.write(data);
req.end();