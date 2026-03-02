# Database Schema - Jira Agency Kanban

## Overview
**File**: `kanban.db` (SQLite3)  
**Location**: `backend/kanban.db`  
**Created**: 2026-03-01 17:51  
**Size**: 24KB  
**Auto-created**: Yes, on first server run

## Tables

### 1. `projects` - Project Management
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY AUTOINCREMENT | Unique project ID |
| name | TEXT NOT NULL | Project name |
| description | TEXT | Project description |
| type | TEXT | Project type: `client`, `agency`, `personal` |
| status | TEXT | Status: `active`, `completed`, `on-hold` |
| health_score | INTEGER | Health score (0-100%) |
| ceo_priority | INTEGER | CEO priority (1=highest) |
| created_at | DATETIME DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | DATETIME DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

### 2. `tasks` - Task Management
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY AUTOINCREMENT | Unique task ID |
| project_id | INTEGER | Foreign key to projects.id |
| title | TEXT NOT NULL | Task title |
| description | TEXT | Task description |
| status | TEXT DEFAULT 'todo' | Status: `todo`, `in-progress`, `review`, `done` |
| priority | TEXT DEFAULT 'medium' | Priority: `low`, `medium`, `high`, `critical` |
| assigned_to | TEXT | Agent assigned (e.g., `@dev`, `@qa`) |
| estimated_hours | INTEGER | Estimated hours to complete |
| actual_hours | INTEGER DEFAULT 0 | Actual hours spent |
| github_issue_id | TEXT | Linked GitHub issue ID |
| needs_ceo_review | BOOLEAN DEFAULT 0 | Flag for CEO review required |
| created_at | DATETIME DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| updated_at | DATETIME DEFAULT CURRENT_TIMESTAMP | Last update timestamp |
| FOREIGN KEY (project_id) REFERENCES projects (id) | | |

### 3. `agents` - Team Management
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY AUTOINCREMENT | Unique agent ID |
| name | TEXT NOT NULL | Agent name (e.g., `@pm`) |
| role | TEXT | Role: `Project Manager`, `Developer`, etc. |
| skills | TEXT | Comma-separated skills |
| availability | TEXT | Availability: `available`, `busy`, `offline` |
| current_load | INTEGER | Current task load (1-5) |
| preferred_hours | INTEGER | Preferred weekly hours |

### 4. `activity_log` - Audit Trail
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY AUTOINCREMENT | Unique log ID |
| user_id | TEXT | User who performed action |
| action | TEXT NOT NULL | Action performed |
| entity_type | TEXT | Entity type: `project`, `task`, `agent` |
| entity_id | INTEGER | Entity ID |
| details | TEXT | Action details (JSON) |
| created_at | DATETIME DEFAULT CURRENT_TIMESTAMP | Creation timestamp |

## Sample Data

### Projects (2)
```sql
INSERT INTO projects (name, description, type, status, health_score, ceo_priority) VALUES
('Infralyze Consulting Website', 'Client website development', 'client', 'active', 65, 1),
('World-Class Kanban System', 'Agency management platform', 'agency', 'active', 85, 1);
```

### Agents (4)
```sql
INSERT INTO agents (name, role, skills, availability, current_load, preferred_hours) VALUES
('@pm', 'Project Manager', 'management,planning,communication', 'available', 2, 40),
('@architect', 'System Architect', 'architecture,devops,scalability', 'available', 1, 40),
('@dev', 'Full-Stack Developer', 'java,spring,react,flutter', 'available', 3, 40),
('@qa', 'Quality Assurance', 'testing,security,ux', 'available', 1, 40);
```

## API Endpoints

### REST API
- `GET /api/projects` - List all projects
- `GET /api/tasks` - List all tasks (with project names)
- `GET /api/agents` - List all agents  
- `GET /api/activity` - Recent activity (last 20 entries)
- `GET /api/ceo/dashboard` - CEO overview stats
- `POST /api/tasks/quick` - Quick task creation (<30s)

### WebSocket Events
- `initial:data` - Sent on connection: {projects, tasks, agents, activity}
- `task:created` - When new task created
- `task:updated` - When task updated
- `project:created` - When new project created  
- `project:updated` - When project updated
- `ceo:alert` - Critical alerts for CEO
- `ceo:decision` - CEO approval decisions

## Database Management

### Reset Database
```bash
# Delete database file
rm backend/kanban.db

# Restart server (will auto-create new database)
cd backend
node server.js
```

### Backup Database
```bash
cp backend/kanban.db backend/kanban-backup-$(date +%Y%m%d).db
```

### View Database (SQLite3 CLI)
```bash
# Install sqlite3 if needed
apt-get install sqlite3

# Explore database
sqlite3 backend/kanban.db
.tables
.schema projects
SELECT * FROM projects;
```

## Health Checks
- **Connection**: Server logs "Connected to SQLite database" on startup
- **Tables**: Automatically created if missing
- **Sample Data**: Inserted if tables are empty
- **API**: All endpoints return valid JSON (or empty arrays)

## Performance
- **SQLite**: File-based, zero configuration
- **Indexes**: Primary keys auto-indexed
- **Queries**: Simple joins for dashboard data
- **Scalability**: Suitable for small-medium agency workload

## Migration Notes
- Schema changes require database reset (data loss)
- Back up before making schema changes
- New columns can be added with ALTER TABLE
- Sample data regenerated on empty database

---
**Last Updated**: 2026-03-01 by @dev  
**Database Version**: 1.0  
**Status**: ✅ Production Ready