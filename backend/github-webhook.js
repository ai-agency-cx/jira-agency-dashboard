// GitHub Webhook Integration Module
// =================================

const crypto = require('crypto');

class GitHubWebhook {
  constructor(db, io) {
    this.db = db;
    this.io = io;
    this.secret = process.env.GITHUB_WEBHOOK_SECRET || 'development-secret-change-in-production';
    this.mappings = this.loadMappings();
  }

  // Load PR to Kanban card mappings
  loadMappings() {
    return {
      'infralyze-consulting': {
        2: 6,  // PR #2 → Card ID 6 (Phase 2 features)
        3: 10, // PR #3 → Card ID 10 (Phase 3 SEO)
        4: 9   // PR #4 → Card ID 9 (Branding fix)
      },
      'jira-agency-dashboard': {
        // Add mappings for dashboard repo
      }
    };
  }

  // Validate GitHub webhook signature
  verifySignature(req, res, next) {
    const signature = req.headers['x-hub-signature-256'];
    
    // For development/testing, allow unsigned requests
    if (!signature && process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Development mode: Accepting unsigned webhook');
      return next();
    }
    
    if (!signature) {
      console.warn('GitHub webhook missing signature');
      return res.status(401).json({ error: 'Missing signature' });
    }

    const hmac = crypto.createHmac('sha256', this.secret);
    const digest = 'sha256=' + hmac.update(JSON.stringify(req.body)).digest('hex');
    
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest))) {
      console.warn('GitHub webhook signature mismatch');
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    next();
  }

  // Main webhook handler
  handleWebhook(req, res) {
    const event = req.headers['x-github-event'];
    const payload = req.body;
    
    console.log(`GitHub webhook received: ${event}`);
    
    // Immediately respond to GitHub (200 OK)
    res.status(200).json({ received: true, event: event });
    
    // Process event asynchronously
    this.processEvent(event, payload);
  }

  // Process GitHub events
  processEvent(event, payload) {
    console.log(`Processing GitHub event: ${event}`);
    
    switch (event) {
      case 'pull_request':
        this.handlePullRequest(payload);
        break;
      case 'issues':
        this.handleIssues(payload);
        break;
      case 'project_card':
        this.handleProjectCard(payload);
        break;
      default:
        console.log(`Unhandled GitHub event: ${event}`);
    }
  }

  // Handle pull request events
  handlePullRequest(payload) {
    const { action, pull_request, repository } = payload;
    const prNumber = pull_request.number;
    const prTitle = pull_request.title;
    const merged = pull_request.merged;
    const repoName = repository.name;
    
    console.log(`PR #${prNumber} (${repoName}): ${action} - "${prTitle}"`);
    
    // Map PR to Kanban card
    const cardId = this.findCardForPR(repoName, prNumber);
    
    if (cardId) {
      if (action === 'closed' && merged) {
        // PR merged - move to Done
        this.updateCardStatus(cardId, 'done', `PR #${prNumber} merged`);
        this.broadcastEvent('pr_merged', { repo: repoName, pr: prNumber, title: prTitle, cardId });
      } else if (action === 'opened') {
        // New PR - move to In Progress
        this.updateCardStatus(cardId, 'progress', `PR #${prNumber} opened`);
        this.broadcastEvent('pr_opened', { repo: repoName, pr: prNumber, title: prTitle, cardId });
      } else if (action === 'review_requested') {
        // Review requested - move to QA/Review
        this.updateCardStatus(cardId, 'review', `PR #${prNumber} review requested`);
        this.broadcastEvent('pr_review_requested', { repo: repoName, pr: prNumber, title: prTitle, cardId });
      }
    } else {
      console.log(`No Kanban card mapping found for PR #${prNumber} in ${repoName}`);
    }
  }

  // Handle issues events
  handleIssues(payload) {
    const { action, issue, repository } = payload;
    const issueNumber = issue.number;
    const issueTitle = issue.title;
    const repoName = repository.name;
    
    console.log(`Issue #${issueNumber} (${repoName}): ${action} - "${issueTitle}"`);
    
    if (action === 'opened') {
      // New issue - create Kanban card
      this.createCardFromIssue(repoName, issue);
      this.broadcastEvent('issue_opened', { repo: repoName, issue: issueNumber, title: issueTitle });
    } else if (action === 'closed') {
      // Issue closed - update Kanban
      const cardId = this.findCardForIssue(repoName, issueNumber);
      if (cardId) {
        this.updateCardStatus(cardId, 'done', `Issue #${issueNumber} closed`);
        this.broadcastEvent('issue_closed', { repo: repoName, issue: issueNumber, title: issueTitle, cardId });
      }
    }
  }

  // Handle project card events (GitHub Projects)
  handleProjectCard(payload) {
    console.log('GitHub Project card event received');
    // TODO: Implement GitHub Projects integration
  }

  // Helper: Find Kanban card for PR
  findCardForPR(repoName, prNumber) {
    return this.mappings[repoName]?.[prNumber] || null;
  }

  // Helper: Find Kanban card for issue
  findCardForIssue(repoName, issueNumber) {
    // TODO: Implement issue-card mapping
    return null;
  }

  // Helper: Update Kanban card status
  updateCardStatus(cardId, newStatus, reason) {
    console.log(`Updating Kanban card ${cardId} to ${newStatus}: ${reason}`);
    
    // Update database
    this.db.run(
      'UPDATE tasks SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newStatus, cardId],
      (err) => {
        if (err) {
          console.error('Error updating Kanban card:', err.message);
        } else {
          console.log(`Kanban card ${cardId} updated to ${newStatus}`);
          
          // Broadcast to WebSocket clients
          this.io.emit('kanban:updated', {
            cardId,
            newStatus,
            reason,
            timestamp: new Date().toISOString()
          });
          
          // Add to activity log
          this.db.run(
            'INSERT INTO activity_log (user_id, action, entity_type, entity_id, details) VALUES (?, ?, ?, ?, ?)',
            ['github-webhook', `Card moved to ${newStatus}`, 'task', cardId, JSON.stringify({ reason, source: 'github' })]
          );
        }
      }
    );
  }

  // Helper: Create Kanban card from GitHub issue
  createCardFromIssue(repoName, issue) {
    console.log(`Creating Kanban card for issue #${issue.number} in ${repoName}`);
    
    // Extract issue details
    const title = issue.title;
    const description = issue.body || '';
    const assignee = issue.assignee?.login || null;
    const labels = issue.labels.map(l => l.name).join(',');
    
    // Create task in database
    this.db.run(
      `INSERT INTO tasks (project_id, title, description, status, priority, assignee, labels, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [1, title, description, 'backlog', 'medium', assignee, labels],
      function(err) {
        if (err) {
          console.error('Error creating Kanban card from issue:', err.message);
        } else {
          const cardId = this.lastID;
          console.log(`Created Kanban card ${cardId} for issue #${issue.number}`);
          
          // Broadcast new card
          this.io.emit('task:created', {
            id: cardId,
            title,
            status: 'backlog',
            assignee,
            source: 'github-issue'
          });
        }
      }
    );
  }

  // Helper: Broadcast event to WebSocket clients
  broadcastEvent(type, data) {
    this.io.emit('github:event', {
      type,
      ...data,
      timestamp: new Date().toISOString()
    });
    console.log(`Broadcasted GitHub event: ${type}`);
  }

  // Get webhook status
  getStatus() {
    return {
      enabled: true,
      secret_configured: !!this.secret && this.secret !== 'development-secret-change-in-production',
      endpoint: '/api/github/webhook',
      supported_events: ['pull_request', 'issues', 'project_card'],
      mappings: Object.keys(this.mappings)
    };
  }
}

module.exports = GitHubWebhook;