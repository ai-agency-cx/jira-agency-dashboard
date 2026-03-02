/**
 * Client-side integration for enhanced dashboard
 * This shows how the frontend connects to the backend
 */

// WebSocket connection
const socket = io('http://localhost:3000');

// API base URL
const API_BASE = 'http://localhost:3000/api';

// Initialize connection
socket.on('connect', () => {
  console.log('Connected to real-time server');
  updateConnectionStatus(true);
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
  updateConnectionStatus(false);
});

// Receive initial data
socket.on('initial:data', (data) => {
  console.log('Received initial data:', data);
  updateDashboard(data);
});

// Real-time updates
socket.on('task:updated', (task) => {
  console.log('Task updated:', task);
  updateTaskInUI(task);
  addActivity({
    icon: '📋',
    bg: '#dbeafe',
    color: '#1d4ed8',
    text: `Task updated: ${task.title}`,
    time: 'Just now'
  });
});

socket.on('project:updated', (project) => {
  console.log('Project updated:', project);
  updateProjectInUI(project);
  addActivity({
    icon: '🚀',
    bg: '#dcfce7',
    color: '#166534',
    text: `Project updated: ${project.name}`,
    time: 'Just now'
  });
});

socket.on('ceo:alert', (alert) => {
  console.log('CEO Alert:', alert);
  showCriticalAlert(alert.message);
  addActivity({
    icon: '⚠️',
    bg: '#fee2e2',
    color: '#dc2626',
    text: alert.message,
    time: 'Just now'
  });
});

// CEO Dashboard Functions
async function loadCEODashboard() {
  try {
    const response = await fetch(`${API_BASE}/ceo/dashboard`);
    const stats = await response.json();
    
    document.getElementById('activeProjects').textContent = stats.active_projects || 0;
    document.getElementById('pendingReview').textContent = stats.pending_review || 0;
    document.getElementById('teamActivity').textContent = Math.round(stats.avg_health || 0) + '%';
    document.getElementById('githubSync').textContent = stats.active_projects > 0 ? '✓' : '✗';
    
  } catch (error) {
    console.error('Error loading CEO dashboard:', error);
  }
}

async function loadPendingApprovals() {
  try {
    const response = await fetch(`${API_BASE}/ceo/pending-approvals`);
    const tasks = await response.json();
    
    if (tasks.length > 0) {
      document.getElementById('criticalAlerts').style.display = 'block';
      document.getElementById('alertText').textContent = 
        `${tasks.length} tasks need your review`;
    }
    
  } catch (error) {
    console.error('Error loading pending approvals:', error);
  }
}

// Project Management
async function loadProjects() {
  try {
    const response = await fetch(`${API_BASE}/projects`);
    const projects = await response.json();
    renderProjects(projects);
  } catch (error) {
    console.error('Error loading projects:', error);
  }
}

async function createProject(name, description, type = 'client') {
  try {
    const response = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description, type })
    });
    
    const result = await response.json();
    if (result.success) {
      console.log('Project created:', result);
      return result;
    }
  } catch (error) {
    console.error('Error creating project:', error);
  }
}

// Task Management
async function loadTasks(filters = {}) {
  try {
    const queryParams = new URLSearchParams(filters).toString();
    const response = await fetch(`${API_BASE}/tasks?${queryParams}`);
    const tasks = await response.json();
    return tasks;
  } catch (error) {
    console.error('Error loading tasks:', error);
    return [];
  }
}

async function createTask(projectId, title, description, priority = 'medium') {
  try {
    const startTime = Date.now();
    const response = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project_id: projectId, title, description, priority })
    });
    
    const result = await response.json();
    const elapsed = Date.now() - startTime;
    
    console.log(`Task created in ${elapsed}ms:`, result);
    return { ...result, elapsed };
    
  } catch (error) {
    console.error('Error creating task:', error);
  }
}

// Quick Task Creation (<30 seconds)
async function createQuickTask(title, projectId = 1) {
  try {
    const startTime = Date.now();
    const response = await fetch(`${API_BASE}/tasks/quick`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, project_id: projectId })
    });
    
    const result = await response.json();
    const elapsed = Date.now() - startTime;
    
    console.log(`Quick task created in ${elapsed}ms:`, result);
    
    // Show success message
    if (elapsed < 30000) {
      showNotification(`✅ Task created in ${elapsed}ms (under 30s!)`);
    } else {
      showNotification(`⚠️ Task created in ${elapsed}ms (slightly over 30s)`);
    }
    
    return { ...result, elapsed };
    
  } catch (error) {
    console.error('Error creating quick task:', error);
    showNotification('❌ Error creating task');
  }
}

// Agent Management
async function loadAgents() {
  try {
    const response = await fetch(`${API_BASE}/agents`);
    const agents = await response.json();
    return agents;
  } catch (error) {
    console.error('Error loading agents:', error);
    return [];
  }
}

// Activity Feed
async function loadActivity(limit = 20) {
  try {
    const response = await fetch(`${API_BASE}/activity?limit=${limit}`);
    const activity = await response.json();
    return activity;
  } catch (error) {
    console.error('Error loading activity:', error);
    return [];
  }
}

// UI Update Functions
function updateConnectionStatus(connected) {
  const indicator = document.querySelector('.live-indicator');
  if (indicator) {
    indicator.innerHTML = connected ? 
      '<span style="color: #10b981;">●</span> LIVE UPDATES' :
      '<span style="color: #ef4444;">●</span> OFFLINE';
  }
}

function updateDashboard(data) {
  // Update CEO stats
  if (data.projects) {
    document.getElementById('activeProjects').textContent = data.projects.length;
  }
  
  if (data.tasks) {
    const pendingReview = data.tasks.filter(t => t.needs_ceo_review).length;
    document.getElementById('pendingReview').textContent = pendingReview;
    
    if (pendingReview > 0) {
      document.getElementById('criticalAlerts').style.display = 'block';
      document.getElementById('alertText').textContent = 
        `${pendingReview} tasks need your review`;
    }
  }
  
  // Update projects grid
  renderProjects(data.projects || []);
  
  // Update activity feed
  updateActivityFeed(data.activity || []);
}

function renderProjects(projects) {
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;
  
  // Clear existing projects (keep the "Add New" card)
  const addNewCard = grid.querySelector('.project-card[onclick*="showAddProjectForm"]');
  grid.innerHTML = '';
  
  projects.forEach(project => {
    const projectCard = createProjectCard(project);
    grid.appendChild(projectCard);
  });
  
  if (addNewCard) {
    grid.appendChild(addNewCard);
  }
}

function createProjectCard(project) {
  const card = document.createElement('div');
  card.className = 'project-card';
  card.innerHTML = `
    <div class="project-header">
      <div class="project-title">${project.name}</div>
      <div class="project-badge ${project.type === 'client' ? 'badge-client' : 'badge-kanban'}">
        ${project.type === 'client' ? 'Client Project' : 'Agency Core'}
      </div>
    </div>
    
    <div class="project-health">
      <span style="color: #475569; font-size: 0.9rem;">Health:</span>
      <div class="health-bar">
        <div class="health-fill ${getHealthClass(project.health_score)}" 
             style="width: ${project.health_score}%;"></div>
      </div>
      <span style="color: ${getHealthColor(project.health_score)}; font-weight: 600;">
        ${project.health_score}%
      </span>
    </div>
    
    <div class="project-meta">
      <div class="meta-item">
        <span>📁</span>
        <span><strong>Status:</strong> ${project.status}</span>
      </div>
      <div class="meta-item">
        <span>⚡</span>
        <span><strong>Priority:</strong> ${getPriorityText(project.ceo_priority)}</span>
      </div>
    </div>
    
    <div class="team-avatars">
      <div class="avatar avatar-pm" title="@pm">PM</div>
      <div class="avatar avatar-arch" title="@architect">ARCH</div>
      <div class="avatar avatar-dev" title="@dev">DEV</div>
      <div class="avatar avatar-qa" title="@qa">QA</div>
    </div>
    
    <div class="project-actions">
      <button class="action-btn btn-primary" onclick="openKanban(${project.id})">
        📋 Kanban Board
      </button>
      <button class="action-btn btn-secondary" onclick="showProjectDetails(${project.id})">
        📊 Details
      </button>
    </div>
  `;
  
  return card;
}

function getHealthClass(score) {
  if (score >= 80) return 'health-good';
  if (score >= 60) return 'health-warning';
  return 'health-critical';
}

function getHealthColor(score) {
  if (score >= 80) return '#10b981';
  if (score >= 60) return '#f59e0b';
  return '#ef4444';
}

function getPriorityText(priority) {
  switch(priority) {
    case 1: return '🔴 Critical';
    case 2: return '🟡 High';
    case 3: return '🟢 Medium';
    default: return '⚪ Low';
  }
}

function updateActivityFeed(activities) {
  const activityList = document.getElementById('activityList');
  if (!activityList) return;
  
  activityList.innerHTML = '';
  
  activities.forEach(activity => {
    const item = document.createElement('div');
    item.className = 'activity-item';
    
    const icon = getActivityIcon(activity.action);
    const time = new Date(activity.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    
    item.innerHTML = `
      <div class="activity-icon" style="background: ${icon.bg}; color: ${icon.color};">${icon.symbol}</div>
      <div class="activity-content">
        <div class="activity-text">${activity.details ? JSON.parse(activity.details).message || activity.action : activity.action}</div>
        <div class="activity-time">${time}</div>
      </div>
    `;
    
    activityList.appendChild(item);
  });
}

function getActivityIcon(action) {
  const icons = {
    'task:created': { symbol: '📋', bg: '#dbeafe', color: '#1d4ed8' },
    'task:updated': { symbol: '✏️', bg: '#dcfce7', color: '#166534' },
    'project:created': { symbol: '🚀', bg: '#fef3c7', color: '#d97706' },
    'project:updated': { symbol: '📈', bg: '#e0f2fe', color: '#0c4a6e' },
    'ceo:approved': { symbol: '👑', bg: '#f3e8ff', color: '#7c3aed' }
  };
  
  return icons[action] || { symbol: '📝', bg: '#f1f5f9', color: '#475569' };
}

// Utility Functions
function showNotification(message) {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    padding: 15px 20px;
    border-radius: 10px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    z-index: 10000;
    animation: slideIn 0.3s ease;
    border-left: 4px solid #10b981;
  `;
  
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function showCriticalAlert(message) {
  const alertBox = document.getElementById('criticalAlerts');
  const alertText = document.getElementById('alertText');
  
  if (alertBox && alertText) {
    alertText.textContent = message;
    alertBox.style.display = 'block';
    
    // Flash animation
    alertBox.style.animation = 'none';
    setTimeout(() => {
      alertBox.style.animation = 'pulse 1s infinite';
    }, 10);
  }
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Initializing enhanced dashboard...');
  
  // Load initial data
  await loadCEODashboard();
  await loadPendingApprovals();
  await loadProjects();
  
  // Start periodic updates
  setInterval(loadCEODashboard, 30000); // Every 30 seconds
  
  // Show connection status
  updateConnectionStatus(socket.connected);
});

// Export for use in enhanced dashboard
window.KanbanAPI = {
  socket,
  loadCEODashboard,
  loadPendingApprovals,
  loadProjects,
  createProject,
  loadTasks,
  createTask,
  createQuickTask,
  loadAgents,
  loadActivity,
  showNotification,
  showCriticalAlert
};