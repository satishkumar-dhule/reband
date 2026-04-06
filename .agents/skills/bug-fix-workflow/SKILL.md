---
name: bug-fix-workflow
description: Standardized TDD-based bug fix workflow with GitHub issue integration for tracking progress.
---

# Skill: Bug Fix Workflow

## Overview

This skill provides a standardized workflow for fixing bugs using TDD (Test-Driven Development) approach, with GitHub issue integration for tracking progress.

## When to Use

Use this skill when:
- User asks to fix bugs from a GitHub issue list
- User wants to process multiple issues using a swarm of agents
- User wants TDD-based bug fixing with proper tracking
- User wants to create issues from a website/page analysis

## Prerequisites

- `gh` CLI installed and authenticated
- Access to target repository
- Issues identified and ready to be fixed

## Workflow

### Step 1: Analyze Issues

1. **List Issues to Process**
   ```bash
   gh issue list --repo owner/repo --label "bug" --state open --limit 20
   ```

2. **Prioritize Issues**
   - HIGH: Critical bugs, security issues, complete breakage
   - MEDIUM: Functional bugs, UI issues, performance problems
   - LOW: Minor issues, improvements, cosmetics

3. **Create Todo List**
   Use TodoWrite to track each issue:
   ```
   - Issue #N: Title (PRIORITY) - status: pending
   ```

### Step 2: Mark Issues as In Progress

Before starting fixes, mark issues to prevent duplicate work:

```bash
# Check available labels first
gh label list --repo owner/repo

# Add in-progress label
gh issue edit <issue-number> --add-label "in-progress"
# OR use custom label
gh issue edit <issue-number> --add-label "opencode-agent"
```

**Important**: Some repos may not have "in-progress" label - use available labels like "opencode-agent" or create one.

### Step 3: Assign Agents (Swarm Pattern)

For multiple independent bugs, spawn agents in parallel using swarm pattern:

```javascript
// Spawn multiple agents in ONE message for parallel execution
Task({
  task_id: 'task-1',
  subagent_type: 'devprep-bug-css',
  description: 'Fix CSS bug #26',
  prompt: 'Fix Issue #26: JSX Structure Bug...'
});

Task({
  task_id: 'task-2',
  subagent_type: 'devprep-bug-state',
  description: 'Fix state bug #27',
  prompt: 'Fix Issue #27: Success Modal Missing...'
});

// ... more agents
```

**Swarm Rules**:
- Never spawn workers sequentially - all independent agents in single message
- Limit to 5-7 workers per fan-out for optimal coordination
- Each agent gets ONE issue to fix
- Use TDD approach in each agent's prompt

### Step 4: TDD Approach for Each Agent

Each agent should follow:

1. **Read** - Examine the buggy code
2. **Fix** - Apply the fix
3. **Verify** - Run TypeScript check, ensure compilation
4. **Report** - Return structured completion status

### Step 5: Aggregate Results

After all agents complete:

```markdown
## Bug Fix Swarm Results

### Completed
- Issue #26: JSX Structure Bug ✅
- Issue #27: Success Modal Missing ✅
...

### Failed (if any)
- Issue #30: CodeEditor Height - Reason for failure

### Verification
- TypeScript compiles for all modified files
- Issues updated in GitHub
```

### Step 6: Update GitHub Issues

Mark completed issues:
```bash
# Close issue with fix comment
gh issue comment <num> --body "Fixed in $(git rev-parse --short HEAD)"
gh issue close <num>

# OR just update labels
gh issue edit <num> --add-label "bot:completed" --remove-label "opencode-agent"
```

## Issue Analysis from Website

When analyzing a website for bugs:

1. **Fetch Page**: Use webfetch to get HTML content
2. **Identify Issues**: Look for:
   - JSX/HTML structure problems
   - CSS layout issues
   - Missing components
   - State management bugs
   - Accessibility issues

3. **Create Issues**: For each bug found:
   ```bash
   gh issue create --repo owner/repo \
     --title "[BUG] Page: Bug Title (SEVERITY)" \
     --body "## Summary\n...\n\n## Location\nfile:line\n\n## Severity\nHIGH/MEDIUM/LOW" \
     --label "bug"
   ```

4. **Handle Permission Issues**:
   - If 403 on creating issues, check token scope
   - Try different repo or regenerate token
   - Fall back to local bug report file

## Common Labels

| Label | Use Case |
|-------|----------|
| `bug` | General bugs |
| `in-progress` | Being fixed |
| `opencode-agent` | AI agent working |
| `bot:completed` | Fixed by bot |
| `priority` | High priority |
| `good first issue` | Beginner friendly |

## Error Handling

| Error | Solution |
|-------|----------|
| 403 Resource not accessible | Check token has `repo` scope |
| Label not found | Check `gh label list` |
| Auth failed | Run `gh auth status` |
| Rate limited | Use `--paginate` or wait |

## Integration

This skill integrates with:
- `github-tasks` skill - for GitHub operations
- `swarm-coordination` skill - for parallel agent execution
- `skill-creator` skill - for creating new bug agents

## Examples

### Example 1: Process 5 Bug Issues

```bash
# 1. List issues
gh issue list --repo owner/repo --label "bug" --state open

# 2. Create todo list
TodoWrite([...])

# 3. Mark as in-progress
for i in 26 27 28 29 30; do
  gh issue edit $i --add-label "opencode-agent"
done

# 4. Spawn 5 agents in parallel
Task({ description: 'Fix bug 26', prompt: '...', subagent_type: '...' })
Task({ description: 'Fix bug 27', prompt: '...', subagent_type: '...' })
Task({ description: 'Fix bug 28', prompt: '...', subagent_type: '...' })
Task({ description: 'Fix bug 29', prompt: '...', subagent_type: '...' })
Task({ description: 'Fix bug 30', prompt: '...', subagent_type: '...' })

# 5. Update on completion
for i in 26 27 28 29 30; do
  gh issue edit $i --add-label "bot:completed" --remove-label "opencode-agent"
done
```

### Example 2: Create Issues from Website Analysis

```python
# For each bug found:
gh issue create --repo owner/repo \
  --title "[BUG] PageName: Issue Title (HIGH)" \
  --body "## Summary\nDescription\n\n## Location\nfile:line\n\n## Steps to Reproduce\n1. ...\n\n## Expected\n...\n\n## Actual\n..." \
  --label "bug"
```

## Best Practices

1. **Always mark in-progress** before starting fixes
2. **Use swarm for multiple independent bugs** (parallel execution)
3. **Each agent fixes ONE issue** for clear accountability
4. **Verify TypeScript** after each fix
5. **Update issue status** when complete
6. **Document failures** if any agent cannot complete