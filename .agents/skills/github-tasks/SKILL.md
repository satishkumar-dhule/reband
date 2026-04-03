---
name: github-tasks
description: When the user wants to manage GitHub issues, pull requests, repositories, or automate GitHub workflows. Also use when user mentions "create issue", "update PR", "manage labels", "sync branches", "GitHub automation", "issue triage", "PR review", "repo settings", or "GitHub operations". This skill covers comprehensive GitHub task automation using gh CLI.
metadata:
  version: 1.0.0
---

# GitHub Tasks Automation

You are an expert in GitHub operations and automation. Your goal is to efficiently manage issues, pull requests, repositories, and automate GitHub workflows using the `gh` CLI.

## Prerequisites

- Ensure `gh` CLI is installed and authenticated: `gh auth status`
- Set the default repo: `gh repo set-default owner/repo`
- Use `--repo owner/repo` flag for cross-repo operations

## Core Operations

### Issue Management

**Create Issues**
```bash
gh issue create --title "Issue title" --body "Description" --label "bug,help wanted" --assignee "@me"
gh issue create --title "Fix performance" --body "$(cat template.md)" --milestone "v1.0"
```

**List & Search Issues**
```bash
gh issue list --state open --label "bug" --limit 20
gh issue list --assignee "@me" --state open
gh issue search "is:issue is:open label:bug reason:no-activity"
gh issue list --milestone "Sprint 5"
```

**Update Issues**
```bash
gh issue close <issue-number>
gh issue reopen <issue-number>
gh issue edit <issue-number> --title "New title" --body "Updated body"
gh issue edit <issue-number> --add-label "priority" --remove-label "needs-triage"
gh issue edit <issue-number> --add-assignee "username" --remove-assignee "old-user"
```

**Issue Comments**
```bash
gh issue comment <issue-number> --body "Thank you for reporting!"
gh issue view <issue-number> --comments
```

### Pull Request Management

**Create PRs**
```bash
gh pr create --title "Feature description" --body "## Changes\n- Added feature" --label "enhancement" --reviewer "user1,user2" --assignee "@me"
gh pr create --base main --head feature-branch
```

**List & Search PRs**
```bash
gh pr list --state open --limit 20
gh pr list --author "@me" --state merged
gh pr list --review-requested "@me"
gh pr search "is:pr is:open draft:true"
```

**PR Operations**
```bash
gh pr merge <pr-number> --squash --delete-branch
gh pr merge <pr-number> --admin --merge
gh pr close <pr-number>
gh pr reopen <pr-number>
gh pr edit <pr-number> --title "Updated title" --add-label "WIP"
```

**PR Reviews**
```bash
gh pr review <pr-number> --approve --comment "LGTM!"
gh pr review <pr-number> --request-changes --body "Please fix the tests"
gh pr checks <pr-number>  # Check CI status
```

**PR Diff & Files**
```bash
gh pr diff <pr-number>
gh pr view <pr-number> --json title,body,state,changedFiles
gh pr checks <pr-number>
```

### Repository Management

**Repository Info**
```bash
gh repo view --json name,description,url,defaultBranchRef
gh repo list <owner> --limit 20
gh repo clone owner/repo
```

**Repository Settings**
```bash
gh repo edit owner/repo --description "New description" --enable-issues=false
gh repo archive owner/repo --confirm
```

**Branches**
```bash
gh branch list
gh branch create <branch-name>
gh branch delete <branch-name> --force
```

**Releases**
```bash
gh release create v1.0.0 --title "Version 1.0" --notes "Release notes"
gh release list
gh release view v1.0.0
gh release delete v1.0.0 --yes
```

### Labels & Milestones

**Labels**
```bash
gh label list
gh label create "priority:high" --color "FF0000" --description "High priority issues"
gh label delete "old-label"
```

**Milestones**
```bash
gh issue milestone list
gh issue milestone create "Sprint 5" --description "Sprint 5 scope"
gh issue milestone close <milestone-id>
```

## Workflows & Actions

**Workflow Management**
```bash
gh workflow list
gh workflow view <workflow-id>
gh workflow run <workflow-name> --field name=value
gh run list --limit 20
gh run watch <run-id>
```

## Templates & Scripts

### Issue Template Workflow
```bash
# Create issue from template
gh issue create --template bug-report.md

# Batch create issues
for i in {1..5}; do
  gh issue create --title "Task $i" --label "task"
done
```

### PR Automation Script Pattern
```bash
#!/bin/bash
# Auto-merge PRs with passing checks
for pr in $(gh pr list --state open --json number --jq '.[].number'); do
  checks=$(gh pr checks $pr --json status --jq '.[].status')
  if [[ "$checks" == "passed" ]]; then
    gh pr merge $pr --squash --delete-branch
  fi
done
```

## Best Practices

1. **Atomic Operations**: Use transactions where available
2. **Idempotency**: Scripts should be safe to run multiple times
3. **Error Handling**: Check exit codes after each gh command
4. **Rate Limits**: Use `--paginate` for large result sets
5. **JSON Output**: Use `--json` flag for scriptable output
6. **Dry Runs**: Use `--dry-run` when available

## Output Formats

**JSON Output for Scripts**
```bash
gh issue list --json number,title,labels,assignees --jq '.[] | {num: .number, title: .title}'
gh pr list --json number,title,state,reviewers --limit 100
```

**Table Output**
```bash
gh issue list --limit 10 --template table
gh pr list --json number,title,headRefName --jq '.'
```

## Automation Patterns

### Issue Triage
```bash
# Triage new issues: add labels, assign, comment
gh issue create --template triage.md
gh issue edit <num> --add-label "needs-triage"
```

### Stale Issue Management
```bash
# Find stale issues
gh issue list --state open --search "no-activity:30d"
gh issue edit <num> --add-label "stale"
```

### PR Review Assignment
```bash
# Auto-assign reviewers based on code owners
gh pr create --reviewer "CODEOWNERS"
```

## Related Skills

- **agent-tools**: For integrating with other AI services
- **cicd-security-reviewer**: For GitHub Actions security
- **github-actions-workflow-auditor**: For workflow review

---

## Task Categories

### Issue Management
- Create, update, close, reopen issues
- Manage labels and milestones
- Assign issues to users
- Add comments and reactions
- Issue search and filtering

### PR Operations
- Create and manage pull requests
- Review and approve/reject PRs
- Merge strategies (squash, merge, rebase)
- Handle merge conflicts
- Auto-assign reviewers

### Repository Management
- View and edit repo settings
- Manage branches
- Handle releases
- Manage labels and milestones
- Repository archiving

### Automation
- Workflow triggering
- Run monitoring
- Batch operations
- Scheduled tasks via GitHub Actions
