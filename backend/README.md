# Jira Agency Kanban Backend

Real-time backend for the world-class agency Kanban system.

## 🚀 Quick Start

```bash
cd /root/jira-agency/backend-prototype
npm install
npm start
```

Server runs on `http://localhost:3000`

## 📋 Features

### Real-time Updates
- WebSocket server (Socket.io)
- Live task/project updates
- CEO alerts and approvals
- Activity feed

### CEO-First Design
- Special CEO dashboard endpoints
- Quick approval system
- Critical alerts only
- Performance metrics

### Agent Autonomy
- Agent availability tracking
- Task auto-assignment (placeholder)
- Skill-based routing
- Load balancing

### Zero Friction
- Quick task creation (<30s API)
- Simple project creation
- Default values for speed
- Minimal configuration

## 🏗️ Architecture

### Tech Stack
- **Runtime**: Node.js + Express
- **Database**: SQLite (file-based, zero setup)
- **Real-time**: Socket.io (WebSockets)
- **API**: REST + WebSockets

### Data Model
- Projects with health scores
- Tasks with priorities and assignments
- Agents with skills and availability
- Activity log for audit trail

## 🔌 API Endpoints

### CEO Endpoints
```
GET  /api/ceo/dashboard          # CEO overview stats
GET  /api/ceo/pending-approvals  # Tasks needing approval
```

### Project Management
```
GET  /api/projects               # List all projects
POST /api/projects              # Create new project
```

### Task Management
```
GET  /api/tasks                 # Filterable task list
POST /api/tasks                 # Create task
POST /api/tasks/quick           # Quick task (<30s)
```

### Agent Management
```
GET  /api/agents                # List all agents
```

### Activity
```
GET  /api/activity              # Recent activity
```

### Health
```
GET  /api/health                # System health check
```

## 🔗 WebSocket Events

### Client → Server
```
task:update     # Update task status/assignment
project:update  # Update project health/status
ceo:approve     # CEO approves/rejects task
```

### Server → Client
```
initial:data    # Initial data on connection
task:created    # New task created
task:updated    # Task updated
project:created # New project created
project:updated # Project updated
ceo:alert       # Critical alert for CEO
ceo:decision    # CEO approval decision
```

## 📊 Database Schema

### Projects
```sql
id, name, description, type, status, health_score,
ceo_priority, created_at, updated_at
```

### Tasks
```sql
id, project_id, title, description, status, priority,
assigned_to, estimated_hours, actual_hours,
github_issue_id, needs_ceo_review, created_at, updated_at
```

### Agents
```sql
id, name, role, skills, availability, current_load,
preferred_hours, created_at
```

### Activity Log
```sql
id, user_id, action, entity_type, entity_id,
details, created_at
```

## 🚀 Deployment

### Local Development
```bash
npm run dev  # With nodemon for auto-restart
```

### Production
```bash
npm start
```

### Environment Variables
```bash
PORT=3000           # Server port
NODE_ENV=production # Environment
```

## 🔧 Next Steps

### Phase 1 (Current)
- Basic real-time functionality
- CEO dashboard integration
- Quick task creation

### Phase 2
- GitHub API integration
- Advanced task assignment
- Performance optimization

### Phase 3
- Mobile PWA enhancements
- Advanced analytics
- Machine learning suggestions

## 📈 Performance Targets

- API response: <200ms
- WebSocket latency: <100ms
- Task creation: <30 seconds
- CEO dashboard load: <1 second
- Uptime: 99.9%

## 🔒 Security

- CORS enabled for development
- Input validation
- SQL injection protection
- Rate limiting (TODO)
- Authentication (TODO - Phase 2)

## 🤝 Contributing

1. Create feature branch: `feat/feature-name`
2. Implement changes
3. Test thoroughly
4. Create PR for review
5. Deploy after approval

## 📞 Support

For issues or questions:
- Create GitHub issue
- Contact @pm for project management
- Contact @architect for technical architecture