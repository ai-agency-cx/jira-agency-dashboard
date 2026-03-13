#!/bin/bash

echo "🚀 Starting Jira Agency Kanban Backend"
echo "======================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Navigate to backend directory
cd /root/jira-agency/backend-prototype

echo "📦 Installing dependencies..."
npm install

echo ""
echo "✅ Dependencies installed successfully!"
echo ""
echo "🏗️  Starting backend server..."
echo ""
echo "📡 Server will run on: http://localhost:3000"
echo "🌐 Frontend: http://localhost:3000/enhanced-dashboard.html"
echo ""
echo "🔌 API Endpoints:"
echo "   - GET  /api/ceo/dashboard          # CEO overview"
echo "   - GET  /api/ceo/pending-approvals  # Tasks needing approval"
echo "   - GET  /api/projects               # List all projects"
echo "   - POST /api/projects              # Create project"
echo "   - GET  /api/tasks                 # Filterable tasks"
echo "   - POST /api/tasks                 # Create task"
echo "   - POST /api/tasks/quick           # Quick task (<30s)"
echo "   - GET  /api/agents                # List agents"
echo "   - GET  /api/activity              # Activity feed"
echo "   - GET  /api/health                # Health check"
echo ""
echo "🔗 WebSocket Events:"
echo "   - Real-time task/project updates"
echo "   - CEO alerts and approvals"
echo "   - Activity feed updates"
echo ""
echo "📊 Sample data includes:"
echo "   - 2 projects (Infralyze, Kanban System)"
echo "   - 4 agents (@pm, @architect, @dev, @qa)"
echo ""
echo "⏱️  Quick test:"
echo "   curl http://localhost:3000/api/ceo/dashboard"
echo ""
echo "Starting server now..."
echo ""

# Start the server
npm start