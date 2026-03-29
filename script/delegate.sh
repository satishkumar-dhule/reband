#!/bin/bash
# DevPrep Agent Delegation Helper
# Usage: ./script/delegate.sh <agent-name> "<task>"
# Example: ./script/delegate.sh devprep-frontend-designer "Add a GitHub-themed settings page"

AGENT="${1}"
TASK="${2}"

if [ -z "$AGENT" ] || [ -z "$TASK" ]; then
  echo "Usage: $0 <agent-name> \"<task>\""
  echo ""
  echo "Available agents:"
  ls .opencode/agents/ | sed 's/\.agent\.md//' | sed 's/\.ts//'
  exit 1
fi

echo "🤖 Delegating to: $AGENT"
echo "📋 Task: $TASK"
echo "---"
opencode run --agent "$AGENT" "$TASK"
