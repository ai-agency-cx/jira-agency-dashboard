# 🚀 Git Workflow Memory - Persists Across Sessions

## **CRITICAL: Session Startup Sequence**
Every new session MUST run these commands first:

```bash
# 1. Set GitHub Token (use token from gh CLI config - auto-extracted)
# Token is automatically extracted from ~/.config/gh/hosts.yml
# If extraction fails, ask CEO @jai for current fine-grained token

# 2. Configure git remotes
cd /root/jira-agency
./configure_git_remotes.sh

# 3. Verify authentication
gh auth status
```

## **Token Information**
- **Current Token**: [AUTO-EXTRACTED FROM GH CLI CONFIG]
- **Token Type**: Fine-grained Personal Access Token
- **Permissions**: Repository-specific permissions
- **Extraction Method**: Automatic from ~/.config/gh/hosts.yml
- **Status**: ✅ WORKING with push permissions

## **Verified Working Commands**
```bash
# Git operations (all work)
git push origin main
git push origin feat/branch-name
git pull origin main
git push origin --delete branch-name

# GitHub CLI operations
gh pr create --title "..." --body "..." --base main
gh pr merge [number] --merge --delete-branch
gh repo view ai-agency-cx/jira-agency-dashboard
```

## **Organization Context**
- **Your Account**: `aiagencycx-dot`
- **Organization**: `ai-agency-cx` (you are ADMIN)
- **Repositories**:
  - `ai-agency-cx/jira-agency-dashboard`
  - `ai-agency-cx/infralyze-consulting`

## **Current Project Status**
### **World-Class Kanban System**
- **PR #4**: "feat: Enhanced CEO dashboard with real-time features"
- **URL**: https://github.com/ai-agency-cx/jira-agency-dashboard/pull/4
- **Status**: Waiting for merge
- **Branch**: `feat/enhanced-ceo-dashboard`
- **Files**: `enhanced-dashboard.html`, updated `index.html`

### **Live URLs (after merge)**
- Enhanced Dashboard: https://ai-agency-cx.github.io/jira-agency-dashboard/enhanced-dashboard.html
- Current Dashboard: https://ai-agency-cx.github.io/jira-agency-dashboard/

## **Scripts Available**
```bash
# Configuration
./configure_git_remotes.sh    # Configures git with token

# PR Creation
./create_pr.sh "Title" "Description"  # Standardized PR creation

# Deployment
./DEPLOY_ENHANCED_DASHBOARD.sh  # Shows enhanced dashboard content
./START_BACKEND.sh             # Starts Node.js backend
```

## **Common Issues & Solutions**
### **Issue: "Permission denied" on git push**
```bash
# Solution: Update token (ask CEO for current fine-grained token)
# Or use auto-extraction from gh CLI config
./configure_git_remotes.sh
```

### **Issue: "Token invalid"**
```bash
# Solution: Ask CEO for new token with:
# - repo scope (full control)
# - workflow scope
# - write:discussion scope
```

### **Issue: Branch conflicts**
```bash
# Solution: Sync with remote
git fetch origin
git reset --hard origin/main
```

## **Session Startup Checklist**
1. [ ] Read this memory file
2. [ ] Set `GITHUB_TOKEN` environment variable
3. [ ] Run `./configure_git_remotes.sh`
4. [ ] Check `TODO.md` for current tasks
5. [ ] Check open PRs: `gh pr list`

## **Recent Achievements**
- ✅ Fixed GitHub token permissions issue
- ✅ Created enhanced CEO dashboard
- ✅ Established working git workflow
- ✅ Created PR #4 (waiting merge)
- ✅ Built backend prototype
- ✅ Created persistent memory system

## **Next Session Priorities**
1. Merge PR #4 if not already merged
2. Test enhanced dashboard deployment
3. Start Phase 2: Real backend integration
4. Implement GitHub API integration

## **Important Notes**
- CEO (@jai) is admin of `ai-agency-cx` organization
- Token allows direct push to organization repos (admin privilege)
- All automation scripts are in `/root/jira-agency/`
- Reference `GIT_WORKFLOW_GUIDE.md` for detailed workflow

---
**Last Updated**: 2026-03-01  
**Memory Created**: After fixing token permissions issue  
**For**: All future sessions to avoid re-solving same problems