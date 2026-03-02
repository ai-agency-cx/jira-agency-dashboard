// Complete JavaScript for real-time dashboard

// WebSocket connection
let socket;
let isConnected = false;
const backendUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'http://localhost:3000' 
    : 'https://your-backend-url.com'; // Update for production

// Initialize WebSocket connection
function connectWebSocket() {
    console.log('Connecting to WebSocket server...');
    
    socket = io(backendUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });

    socket.on('connect', () => {
        console.log('✅ Connected to WebSocket server');
        isConnected = true;
        updateConnectionStatus('Connected', true);
        
        // Request initial data
        socket.emit('request:initial-data');
    });

    socket.on('disconnect', () => {
        console.log('❌ Disconnected from WebSocket server');
        isConnected = false;
        updateConnectionStatus('Disconnected', false);
    });

    socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error);
        updateConnectionStatus('Connection Error', false);
    });

    // Handle initial data
    socket.on('initial:data', (data) => {
        console.log('Received initial data:', data);
        updateDashboard(data);
    });

    // Handle real-time updates
    socket.on('task:created', (task) => {
        console.log('New task created:', task);
        addActivity(`📋 New task: "${task.title}"`, 'Just now');
    });

    socket.on('task:updated', (task) => {
        console.log('Task updated:', task);
        addActivity(`⚡ Task updated: "${task.title}"`, 'Just now');
    });

    socket.on('project:created', (project) => {
        console.log('New project created:', project);
        addActivity(`🚀 New project: "${project.name}"`, 'Just now');
        loadProjects(); // Reload projects
    });

    socket.on('project:updated', (project) => {
        console.log('Project updated:', project);
        addActivity(`📊 Project updated: "${project.name}"`, 'Just now');
        loadProjects(); // Reload projects
    });

    socket.on('ceo:alert', (alert) => {
        console.log('CEO Alert:', alert);
        addActivity(`👑 ${alert.message}`, 'Just now', '#fef3c7', '#d97706');
    });
}

// Update connection status UI
function updateConnectionStatus(status, connected) {
    const statusElement = document.getElementById('connectionStatus');
    const indicator = document.getElementById('connectionIndicator');
    
    statusElement.textContent = status;
    
    if (connected) {
        indicator.className = 'connection-status connected';
        indicator.querySelector('span').textContent = 'Connected';
    } else {
        indicator.className = 'connection-status disconnected';
        indicator.querySelector('span').textContent = 'Disconnected';
    }
}

// Update dashboard with data
function updateDashboard(data) {
    // Update quick stats
    if (data.stats) {
        document.getElementById('activeProjects').textContent = data.stats.active_projects || '--';
        document.getElementById('pendingReview').textContent = data.stats.pending_review || '--';
        document.getElementById('teamActivity').textContent = (data.stats.team_activity || '--') + '%';
    }
    
    // Update projects
    if (data.projects) {
        loadProjects(data.projects);
    }
    
    // Update last updated time
    document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Load projects into UI
function loadProjects(projectsData) {
    const projectList = document.getElementById('projectList');
    
    if (!projectsData) {
        // Fetch from API if not provided
        fetch(`${backendUrl}/api/projects`)
            .then(response => response.json())
            .then(projects => displayProjects(projects))
            .catch(error => {
                console.error('Error fetching projects:', error);
                projectList.innerHTML = '<div class="project-item"><div class="project-info"><div class="project-name">Error loading projects</div></div></div>';
            });
        return;
    }
    
    displayProjects(projectsData);
}

function displayProjects(projects) {
    const projectList = document.getElementById('projectList');
    
    if (!projects || projects.length === 0) {
        projectList.innerHTML = '<div class="project-item"><div class="project-info"><div class="project-name">No projects found</div></div></div>';
        return;
    }
    
    let html = '';
    
    projects.forEach(project => {
        // Determine health color
        let healthColor = '#10b981'; // Green
        if (project.health_score < 70) healthColor = '#f59e0b'; // Yellow
        if (project.health_score < 50) healthColor = '#ef4444'; // Red
        
        // Determine project type icon
        let icon = '📊';
        if (project.type === 'client') icon = '👔';
        if (project.type === 'agency') icon = '🏢';
        if (project.type === 'personal') icon = '👤';
        
        html += `
            <div class="project-item">
                <div class="project-icon" style="background: ${getProjectColor(project.type)}; color: white;">
                    ${icon}
                </div>
                <div class="project-info">
                    <div class="project-name">${project.name}</div>
                    <div class="project-meta">
                        <span>${project.type}</span>
                        <span>${project.status}</span>
                        <span>Health: ${project.health_score}%</span>
                    </div>
                    <div class="health-bar">
                        <div class="health-fill" style="width: ${project.health_score}%; background: ${healthColor};"></div>
                    </div>
                </div>
            </div>
        `;
    });
    
    projectList.innerHTML = html;
}

function getProjectColor(type) {
    const colors = {
        'client': '#3b82f6',    // Blue
        'agency': '#8b5cf6',    // Purple
        'personal': '#10b981',  // Green
        'default': '#64748b'    // Gray
    };
    return colors[type] || colors.default;
}

// Add activity to feed
function addActivity(text, time, bgColor = '#f3e8ff', textColor = '#7c3aed') {
    const activityList = document.getElementById('activityList');
    
    const newItem = document.createElement('div');
    newItem.className = 'activity-item';
    newItem.innerHTML = `
        <div class="activity-icon" style="background: ${bgColor}; color: ${textColor};">${getActivityIcon(text)}</div>
        <div class="activity-content">
            <div class="activity-text">${text}</div>
            <div class="activity-time">${time}</div>
        </div>
    `;
    
    // Add new item at top
    activityList.insertBefore(newItem, activityList.firstChild);
    
    // Remove oldest item if more than 4
    if (activityList.children.length > 4) {
        activityList.removeChild(activityList.lastChild);
    }
}

function getActivityIcon(text) {
    if (text.includes('📋') || text.includes('task')) return '📋';
    if (text.includes('⚡') || text.includes('updated')) return '⚡';
    if (text.includes('🚀') || text.includes('project')) return '🚀';
    if (text.includes('👑') || text.includes('CEO')) return '👑';
    if (text.includes('📱') || text.includes('PWA')) return '📱';
    if (text.includes('🔗') || text.includes('webhook')) return '🔗';
    return '💬';
}

// PWA Installation
let deferredPrompt;

function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted PWA installation');
                document.getElementById('pwaInstall').style.display = 'none';
            }
            deferredPrompt = null;
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Connect to WebSocket
    connectWebSocket();
    
    // Show PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        setTimeout(() => {
            document.getElementById('pwaInstall').style.display = 'flex';
        }, 5000);
    });
    
    // Update time every minute
    setInterval(() => {
        if (isConnected) {
            document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        }
    }, 60000);
    
    // Add initial activity
    addActivity('🔗 Connected to real-time server', 'Just now', '#e0f2fe', '#0c4a6e');
    addActivity('📊 Loading project data...', 'Just now', '#dbeafe', '#1d4ed8');
});

// Manual refresh function (can be called from console)
function refreshDashboard() {
    if (isConnected) {
        socket.emit('request:initial-data');
        addActivity('🔄 Manual refresh requested', 'Just now', '#fef3c7', '#d97706');
    }
}