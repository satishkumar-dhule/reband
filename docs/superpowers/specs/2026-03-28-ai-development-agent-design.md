# AI Development Agent - Design Specification

**Date:** 2026-03-28  
**Status:** Draft  
**Author:** DevPrep Architecture Team

---

## Executive Summary

This document describes the architecture for an **AI Development Agent** (`devprep-dev-agent`) that can autonomously build, improve, and maintain DevPrep using AI code generation. Inspired by Replit's agentic development patterns and integrated with existing infrastructure via `infsh` CLI, this agent enables sustainable AI-driven development.

---

## 1. Problem Statement

DevPrep currently relies on manual development for:
- Adding new features
- Fixing bugs and refactoring code
- Writing and maintaining tests
- Improving code quality

As the platform grows, manual development becomes a bottleneck. We need an AI-powered agent that can:
1. Understand the codebase structure
2. Execute development tasks autonomously
3. Maintain safety guardrails
4. Report progress and handle failures gracefully

---

## 2. Design Principles

### 2.1 Safety First
- **No auto-merge**: AI generates code; humans review and approve
- **Isolated execution**: AI works in sandboxed branches, never main
- **Audit everything**: All actions logged to bot ledger
- **Rollback capability**: Every change is reversible

### 2.2 Clear Boundaries
- AI can read any file in the codebase
- AI can create new files in designated directories
- AI can modify existing files only with explicit task approval
- AI cannot delete files or execute arbitrary commands

### 2.3 Human-in-the-Loop
- All code changes require human approval before merging
- AI can suggest but not decide on architecture changes
- AI can flag issues but cannot mark them as resolved without verification

---

## 3. Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        AI Development Agent                          │
│                      devprep-dev-agent                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐  │
│  │ Task       │    │ Code       │    │ Execution               │  │
│  │ Parser     │───▶│ Generator  │───▶│ Sandbox                 │  │
│  │            │    │ (Claude)    │    │ (Branch + PR)           │  │
│  └─────────────┘    └─────────────┘    └─────────────────────────┘  │
│        │                 │                       │                   │
│        ▼                 ▼                       ▼                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐  │
│  │ Context     │    │ Safety     │    │ Review                  │  │
│  │ Builder     │    │ Guardrails │    │ Workflow                │  │
│  │             │    │            │    │ (Human Approval)        │  │
│  └─────────────┘    └─────────────┘    └─────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  infsh CLI      │
                    │  Claude Sonnet  │
                    │  45 / Opus      │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ GitHub          │
                    │ (Branch + PR)   │
                    └──────────────────┘
```

---

## 4. Core Components

### 4.1 Task Parser

```typescript
// src/agents/dev-agent/task-parser.ts

export interface DevTask {
  id: string;
  type: 'feature' | 'bugfix' | 'refactor' | 'test' | 'improvement';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  targetFiles?: string[];       // Specific files to modify
  targetDirectory?: string;     // Or entire directory
  constraints: TaskConstraints;
  context: TaskContext;
}

export interface TaskConstraints {
  languages?: string[];         // ['typescript', 'tsx']
  frameworks?: string[];        // ['react', 'express']
  noBreakingChanges: boolean;    // Can't break existing API
  testRequired: boolean;        // Must include tests
  backwardCompatible: boolean;   // Must work with existing data
}

export interface TaskContext {
  relevantFiles: string[];       // Files AI should read first
  recentChanges?: string[];     // Recent commits affecting this task
  relatedComponents?: string[]; // Connected components
  testFiles?: string[];         // Existing tests
}

export type TaskInput = 
  | { type: 'text'; content: string }
  | { type: 'issue'; issueId: string }
  | { type: 'api'; endpoint: string; changes: string[] };
```

**Responsibilities:**
1. Parse natural language task descriptions
2. Identify target files/directories
3. Determine constraints based on task type
4. Build context by finding related files

### 4.2 Context Builder

```typescript
// src/agents/dev-agent/context-builder.ts

export interface CodebaseContext {
  structure: ProjectStructure;
  dependencies: DependencyGraph;
  patterns: CodingPatterns;
  history: ChangeHistory;
}

export interface ProjectStructure {
  root: string;
  src: {
    client: string;      // client/src/
    server: string;      // server/
    shared: string;      // shared/
    agents: string;      // client/src/agents/
    components: string;  // client/src/components/
  };
  config: {
    tsconfig: string;
    packageJson: string;
    tailwind: string;
  };
}

export interface CodingPatterns {
  componentPatterns: ComponentPattern[];
  apiPatterns: APIPattern[];
  statePatterns: StatePattern[];
  testPatterns: TestPattern[];
}

export interface ComponentPattern {
  name: string;
  template: string;
  example: string;
}

export class ContextBuilder {
  async build(task: DevTask): Promise<CodebaseContext> {
    return {
      structure: await this.analyzeStructure(),
      dependencies: await this.analyzeDependencies(),
      patterns: await this.extractPatterns(),
      history: await this.getRecentHistory(),
    };
  }

  async getRelevantContext(task: DevTask): Promise<string> {
    // Returns a context string suitable for Claude prompt
    const context = await this.build(task);
    
    return `
PROJECT STRUCTURE:
${this.formatStructure(context.structure)}

CODING PATTERNS:
${this.formatPatterns(context.patterns)}

RECENT CHANGES:
${this.formatHistory(context.history)}

TASK CONSTRAINTS:
- Languages: ${task.constraints.languages?.join(', ') || 'any'}
- Frameworks: ${task.constraints.frameworks?.join(', ') || 'any'}
- No breaking changes: ${task.constraints.noBreakingChanges}
- Tests required: ${task.constraints.testRequired}
`;
  }
}
```

### 4.3 Code Generator

```typescript
// src/agents/dev-agent/code-generator.ts

export interface GenerationRequest {
  task: DevTask;
  context: string;          // Formatted context from ContextBuilder
  files: Map<string, string>;  // Existing file contents
}

export interface GenerationResult {
  success: boolean;
  changes: FileChange[];
  explanations: string[];
  tests?: TestChanges;
  warnings?: string[];
}

export interface FileChange {
  path: string;
  action: 'create' | 'modify';
  content: string;
  diff?: string;           // For 'modify' actions
  reason: string;          // Why this change was made
}

export interface TestChanges {
  additions: string[];
  modifications: string[];
  newTestFiles: FileChange[];
}

export class CodeGenerator {
  private model = 'openrouter/claude-sonnet-45';
  
  async generate(request: GenerationRequest): Promise<GenerationResult> {
    const prompt = this.buildPrompt(request);
    
    const response = await this.callClaude(prompt);
    
    return this.parseResponse(response, request);
  }

  private buildPrompt(request: GenerationRequest): string {
    const { task, context, files } = request;
    
    return `
You are the DevPrep AI Development Agent. Generate code to implement the following task.

## TASK
Type: ${task.type}
Priority: ${task.priority}
Title: ${task.title}
Description: ${task.description}

## CONSTRAINTS
${task.constraints.noBreakingChanges ? '- MUST NOT break existing functionality' : ''}
${task.constraints.testRequired ? '- MUST include tests' : ''}
${task.constraints.backwardCompatible ? '- MUST be backward compatible' : ''}
${task.constraints.languages ? `- Languages: ${task.constraints.languages.join(', ')}` : ''}

## PROJECT CONTEXT
${context}

## EXISTING CODE TO UNDERSTAND
${this.formatFiles(files)}

## INSTRUCTIONS
1. Read all existing code carefully
2. Follow existing patterns and conventions
3. Generate complete, working code
4. Include comments explaining complex logic
5. For modifications, provide diff showing exact changes
6. For tests, use existing test patterns

Return your response in this format:
\`\`\`json
{
  "changes": [
    {
      "path": "relative/path/to/file.ts",
      "action": "create|modify",
      "content": "full file content or diff",
      "reason": "brief explanation"
    }
  ],
  "explanations": ["explanation 1", "explanation 2"],
  "tests": {
    "additions": ["test description 1"],
    "modifications": ["test modification 1"]
  },
  "warnings": ["any potential issues to be aware of"]
}
\`\`\`
`;
  }
}
```

### 4.4 Safety Guardrails

```typescript
// src/agents/dev-agent/guardrails.ts

export interface SafetyCheck {
  name: string;
  passed: boolean;
  message: string;
  severity: 'error' | 'warning';
}

export class SafetyGuardrails {
  private forbiddenPatterns = [
    // No direct database mutations outside ORM
    /DROP\s+TABLE/i,
    /DELETE\s+FROM.*WHERE\s+1\s*=\s*1/i,
    /TRUNCATE/i,
    
    // No hardcoded secrets
    /password\s*=\s*["'][^"']{8,}/i,
    /api[_-]?key\s*=\s*["'][^"']{20,}/i,
    /secret\s*=\s*["'][^"']{20,}/i,
    
    // No eval or dangerous functions
    /eval\s*\(/,
    /new\s+Function\s*\(/,
    /exec\s*\(/,
    
    // No console.log in production code (allowed in dev only)
    /console\.log\(.*\.(env|config|secret)/i,
  ];

  private readonly MAX_FILE_SIZE = 50000; // 50KB
  private readonly MAX_FILES_IN_CHANGE = 20;

  async validate(changes: FileChange[]): Promise<SafetyCheck[]> {
    const checks: SafetyCheck[] = [];

    // Check 1: No forbidden patterns
    checks.push(...this.checkForbiddenPatterns(changes));

    // Check 2: File size limits
    checks.push(...this.checkFileSizes(changes));

    // Check 3: Number of files
    checks.push(this.checkFileCount(changes));

    // Check 4: Valid file paths
    checks.push(...this.validateFilePaths(changes));

    // Check 5: TypeScript syntax
    checks.push(...await this.validateSyntax(changes));

    return checks;
  }

  private checkForbiddenPatterns(changes: FileChange[]): SafetyCheck[] {
    const checks: SafetyCheck[] = [];

    for (const change of changes) {
      for (const pattern of this.forbiddenPatterns) {
        if (pattern.test(change.content)) {
          checks.push({
            name: 'forbidden_pattern',
            passed: false,
            message: `File ${change.path} contains forbidden pattern: ${pattern.toString()}`,
            severity: 'error',
          });
        }
      }
    }

    return checks;
  }

  private checkFileSizes(changes: FileChange[]): SafetyCheck[] {
    const checks: SafetyCheck[] = [];

    for (const change of changes) {
      if (change.content.length > this.MAX_FILE_SIZE) {
        checks.push({
          name: 'file_size',
          passed: false,
          message: `File ${change.path} exceeds ${this.MAX_FILE_SIZE} bytes`,
          severity: 'error',
        });
      }
    }

    return checks;
  }

  private checkFileCount(changes: FileChange[]): SafetyCheck {
    if (changes.length > this.MAX_FILES_IN_CHANGE) {
      return {
        name: 'file_count',
        passed: false,
        message: `Too many files (${changes.length}). Split into smaller tasks.`,
        severity: 'error',
      };
    }

    return {
      name: 'file_count',
      passed: true,
      message: `File count (${changes.length}) within limits`,
      severity: 'warning',
    };
  }

  private validateFilePaths(changes: FileChange[]): SafetyCheck[] {
    const checks: SafetyCheck[] = [];
    const allowedDirs = [
      'client/src/',
      'server/',
      'shared/',
      'script/',
      'packages/',
    ];
    const forbiddenDirs = [
      '.env',
      'node_modules/',
      'dist/',
      '.git/',
    ];

    for (const change of changes) {
      // Must be in allowed directories
      const inAllowedDir = allowedDirs.some(dir => 
        change.path.startsWith(dir)
      );
      
      if (!inAllowedDir) {
        checks.push({
          name: 'invalid_path',
          passed: false,
          message: `File ${change.path} is not in an allowed directory`,
          severity: 'error',
        });
      }

      // Must not be in forbidden directories
      const inForbiddenDir = forbiddenDirs.some(dir =>
        change.path.includes(dir)
      );

      if (inForbiddenDir) {
        checks.push({
          name: 'forbidden_path',
          passed: false,
          message: `File ${change.path} is in a forbidden directory`,
          severity: 'error',
        });
      }
    }

    return checks;
  }

  private async validateSyntax(changes: FileChange[]): Promise<SafetyCheck[]> {
    const checks: SafetyCheck[] = [];
    const tsChanges = changes.filter(c => 
      c.path.endsWith('.ts') || c.path.endsWith('.tsx')
    );

    for (const change of tsChanges) {
      // Use TypeScript compiler to check syntax
      const isValid = await this.checkTypeScriptSyntax(change.content);
      
      if (!isValid) {
        checks.push({
          name: 'typescript_syntax',
          passed: false,
          message: `File ${change.path} has TypeScript syntax errors`,
          severity: 'error',
        });
      }
    }

    return checks;
  }

  private async checkTypeScriptSyntax(content: string): Promise<boolean> {
    // Implementation using TypeScript compiler API
    // Returns true if syntax is valid
    return true; // Placeholder
  }

  getBlockingErrors(checks: SafetyCheck[]): SafetyCheck[] {
    return checks.filter(c => 
      c.severity === 'error' && !c.passed
    );
  }

  getWarnings(checks: SafetyCheck[]): SafetyCheck[] {
    return checks.filter(c => c.severity === 'warning' || !c.passed);
  }
}
```

### 4.5 Execution Sandbox

```typescript
// src/agents/dev-agent/execution-sandbox.ts

export interface ExecutionResult {
  success: boolean;
  branchName: string;
  prUrl?: string;
  buildStatus?: 'pending' | 'passed' | 'failed';
  testStatus?: 'pending' | 'passed' | 'failed';
  errors?: string[];
  logs: string[];
}

export class ExecutionSandbox {
  private readonly GITHUB_TOKEN: string;
  private readonly REPO_OWNER = 'devprep';
  private readonly REPO_NAME = 'devprep';

  async execute(
    changes: FileChange[],
    task: DevTask
  ): Promise<ExecutionResult> {
    const branchName = await this.createBranch(task);
    
    try {
      // Push changes
      await this.pushChanges(branchName, changes);
      
      // Create PR
      const prUrl = await this.createPR(branchName, task);
      
      // Trigger CI checks
      const buildStatus = await this.waitForCI(branchName);
      
      return {
        success: true,
        branchName,
        prUrl,
        buildStatus,
        testStatus: buildStatus,
        logs: [`Created branch ${branchName}`, `Pushed ${changes.length} files`, `PR: ${prUrl}`],
      };
    } catch (error) {
      return {
        success: false,
        branchName,
        errors: [error instanceof Error ? error.message : String(error)],
        logs: [`Error during execution: ${error}`],
      };
    }
  }

  private async createBranch(task: DevTask): Promise<string> {
    const timestamp = Date.now();
    const sanitizedTitle = task.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .substring(0, 50);
    
    const branchName = `ai-dev/${task.type}/${sanitizedTitle}-${timestamp}`;
    
    // Create branch via GitHub API
    const response = await fetch(
      `https://api.github.com/repos/${this.REPO_OWNER}/${this.REPO_NAME}/git/refs`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ref: `refs/heads/${branchName}`,
          sha: await this.getMainBranchSHA(),
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create branch: ${response.statusText}`);
    }

    return branchName;
  }

  private async pushChanges(branchName: string, changes: FileChange[]): Promise<void> {
    // Implementation using GitHub API or GitHub CLI
    // Creates/updates files in the branch
  }

  private async createPR(branchName: string, task: DevTask): Promise<string> {
    const prBody = `
## AI Development Agent - Task Completion

### Task
**${task.title}**

${task.description}

### Changes
${task.targetFiles ? `Files modified: ${task.targetFiles.join(', ')}` : ''}

### Constraints Applied
- No breaking changes: ${task.constraints.noBreakingChanges}
- Tests included: ${task.constraints.testRequired}
- Backward compatible: ${task.constraints.backwardCompatible}

### Review Checklist
- [ ] Code follows existing patterns
- [ ] TypeScript compiles without errors
- [ ] Tests pass
- [ ] No breaking changes to API
- [ ] Documentation updated if needed

---
*Generated by DevPrep AI Development Agent*
`;

    const response = await fetch(
      `https://api.github.com/repos/${this.REPO_OWNER}/${this.REPO_NAME}/pulls`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.GITHUB_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: `[AI] ${task.title}`,
          head: branchName,
          base: 'main',
          body: prBody,
          draft: true, // Always start as draft
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to create PR: ${response.statusText}`);
    }

    const pr = await response.json();
    return pr.html_url;
  }

  private async waitForCI(branchName: string): Promise<'passed' | 'failed' | 'pending'> {
    // Poll GitHub Actions status
    // Return after 5 minutes max
    return 'passed'; // Placeholder
  }
}
```

---

## 5. Main Agent Orchestrator

```typescript
// src/agents/dev-agent/index.ts

export class DevPrepDevAgent {
  private taskParser: TaskParser;
  private contextBuilder: ContextBuilder;
  private codeGenerator: CodeGenerator;
  private safetyGuardrails: SafetyGuardrails;
  private executionSandbox: ExecutionSandbox;
  private ledger: AuditLedger;

  async executeTask(taskInput: TaskInput): Promise<DevAgentResult> {
    const taskId = this.generateTaskId();
    const startTime = Date.now();

    // Log task start
    await this.ledger.log({
      taskId,
      action: 'task_started',
      input: taskInput,
    });

    try {
      // Step 1: Parse task
      const task = await this.taskParser.parse(taskInput);
      console.log(`[DevAgent] Parsed task: ${task.title}`);

      // Step 2: Build context
      const context = await this.contextBuilder.getRelevantContext(task);
      const files = await this.contextBuilder.loadRelevantFiles(task);
      console.log(`[DevAgent] Built context with ${files.size} files`);

      // Step 3: Generate code
      const generationResult = await this.codeGenerator.generate({
        task,
        context,
        files,
      });

      if (!generationResult.success) {
        throw new Error('Code generation failed');
      }

      console.log(`[DevAgent] Generated ${generationResult.changes.length} changes`);

      // Step 4: Run safety checks
      const safetyChecks = await this.safetyGuardrails.validate(generationResult.changes);
      const blockingErrors = this.safetyGuardrails.getBlockingErrors(safetyChecks);

      if (blockingErrors.length > 0) {
        await this.ledger.log({
          taskId,
          action: 'safety_check_failed',
          errors: blockingErrors,
        });
        return {
          success: false,
          taskId,
          errors: blockingErrors.map(e => e.message),
          safetyWarnings: this.safetyGuardrails.getWarnings(safetyChecks),
        };
      }

      console.log(`[DevAgent] Safety checks passed`);

      // Step 5: Execute in sandbox (create branch + PR)
      const executionResult = await this.executionSandbox.execute(
        generationResult.changes,
        task
      );

      // Log completion
      await this.ledger.log({
        taskId,
        action: 'task_completed',
        changes: generationResult.changes.map(c => c.path),
        prUrl: executionResult.prUrl,
        duration: Date.now() - startTime,
      });

      return {
        success: true,
        taskId,
        changes: generationResult.changes,
        prUrl: executionResult.prUrl!,
        explanations: generationResult.explanations,
        warnings: generationResult.warnings,
        safetyWarnings: this.safetyGuardrails.getWarnings(safetyChecks),
        duration: Date.now() - startTime,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      await this.ledger.log({
        taskId,
        action: 'task_failed',
        error: errorMessage,
      });

      return {
        success: false,
        taskId,
        errors: [errorMessage],
      };
    }
  }

  private generateTaskId(): string {
    return `dev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export interface DevAgentResult {
  success: boolean;
  taskId: string;
  changes?: FileChange[];
  prUrl?: string;
  explanations?: string[];
  warnings?: string[];
  safetyWarnings?: SafetyCheck[];
  errors: string[];
  duration?: number;
}
```

---

## 6. Task Types

### 6.1 Feature Development

```typescript
// Example: Add dark mode toggle persistence
{
  type: 'feature',
  title: 'Persist dark mode preference to localStorage',
  description: 'When users toggle dark mode, save their preference to localStorage so it persists across sessions.',
  targetFiles: ['client/src/components/ThemeToggle.tsx'],
  constraints: {
    noBreakingChanges: true,
    testRequired: true,
    backwardCompatible: true,
  }
}
```

### 6.2 Bug Fix

```typescript
// Example: Fix voice recording timeout
{
  type: 'bugfix',
  title: 'Fix voice recording timeout after 60 seconds',
  description: 'Voice recording stops after exactly 60 seconds even if user hasn\'t stopped. Investigate and fix the timeout issue in the recording panel.',
  targetFiles: ['client/src/components/unified/RecordingPanel.tsx'],
  constraints: {
    noBreakingChanges: true,
    testRequired: true,
    backwardCompatible: true,
  }
}
```

### 6.3 Refactoring

```typescript
// Example: Extract reusable button component
{
  type: 'refactor',
  title: 'Extract unified button component patterns',
  description: 'There are 5+ button variants across the codebase. Create a unified Button component in client/src/components/unified/Button.tsx that consolidates all patterns.',
  targetDirectory: 'client/src/components/',
  constraints: {
    noBreakingChanges: true,
    testRequired: true,
    backwardCompatible: true,
  }
}
```

### 6.4 Test Writing

```typescript
// Example: Add tests for coding challenge execution
{
  type: 'test',
  title: 'Add unit tests for coding-challenges.ts',
  description: 'Add comprehensive tests for executeJavaScript, runTests, and runTestsAsync functions.',
  targetFiles: ['client/src/lib/coding-challenges.ts'],
  constraints: {
    noBreakingChanges: true,
    testRequired: true,
    backwardCompatible: true,
  }
}
```

---

## 7. Integration with Existing Systems

### 7.1 Message Bus Integration

```typescript
// Register with existing AgentMessageBus
import { messageBus, createMessage } from '../core/AgentMessageBus';

const devAgent = new DevPrepDevAgent();

messageBus.registerAgent({
  id: 'devprep-dev-agent',
  name: 'DevPrep Development Agent',
  description: 'AI-powered agent for autonomous code generation',
  capabilities: ['feature', 'bugfix', 'refactor', 'test', 'improvement'],
  status: 'idle',
  subscriptions: new Set(),
});

// Listen for development tasks
messageBus.onMessage('devprep-dev-agent', async (message) => {
  if (message.type === 'REQUEST' && message.payload.action === 'dev-task') {
    const result = await devAgent.executeTask({
      type: 'text',
      content: message.payload.task,
    });

    messageBus.send(createMessage(
      'devprep-dev-agent',
      message.from,
      'RESPONSE',
      { result },
      message.id
    ));
  }
});
```

### 7.2 Bot Ledger Integration

```typescript
// Leverage existing bot_ledger table
import { client } from '../../db';

async function logToLedger(
  taskId: string,
  action: string,
  data: Record<string, any>
): Promise<void> {
  await client.execute({
    sql: `INSERT INTO bot_ledger 
          (bot_name, action, item_type, item_id, result, created_at)
          VALUES (?, ?, ?, ?, ?, ?)`,
    args: [
      'devprep-dev-agent',
      action,
      'dev_task',
      taskId,
      JSON.stringify(data),
      new Date().toISOString(),
    ],
  });
}
```

### 7.3 Work Queue Integration

```typescript
// Dev tasks can be added to work queue
async function addDevTaskToQueue(
  task: DevTask
): Promise<number> {
  const result = await client.execute({
    sql: `INSERT INTO work_queue 
          (item_type, item_id, action, priority, reason, created_by, status)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      'dev_task',
      task.id,
      'execute',
      task.priority === 'critical' ? 1 : task.priority === 'high' ? 2 : 5,
      task.description,
      'devprep-dev-agent',
      'pending',
    ],
  });
  
  return result.lastInsertRowid as number;
}
```

---

## 8. CLI Interface

```bash
# src/agents/dev-agent/cli.ts
# Usage: npx tsx src/agents/dev-agent/cli.ts [command] [options]

# Run a development task
npx tsx src/agents/dev-agent/cli.ts run "Add dark mode persistence to localStorage"

# Run a bug fix
npx tsx src/agents/dev-agent/cli.ts fix "Voice recording times out after 60 seconds"

# Run with specific constraints
npx tsx src/agents/dev-agent/cli.ts run "Add new channel for ML/AI" \
  --types feature \
  --priority high \
  --no-breaking-changes \
  --include-tests

# List recent tasks
npx tsx src/agents/dev-agent/cli.ts list --limit 10

# Check task status
npx tsx src/agents/dev-agent/cli.ts status dev-1234567890
```

---

## 9. Example Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│ User/Admin requests task                                             │
│ "Add a feature to save user progress to the database"               │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Task Parser                                                          │
│ - Identifies as feature task                                         │
│ - Target: database operations in server/                            │
│ - Constraints: no breaking changes, include tests                    │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Context Builder                                                      │
│ - Loads schema.ts, db.ts, routes.ts                                  │
│ - Extracts patterns for database operations                           │
│ - Finds related files (user progress tracking)                        │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Code Generator (Claude Sonnet 45 via infsh)                          │
│ - Analyzes existing code patterns                                     │
│ - Generates new API endpoints and DB operations                       │
│ - Includes TypeScript types and error handling                       │
│ - Creates test file                                                  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Safety Guardrails                                                    │
│ - No forbidden patterns detected                                     │
│ - All files within size limits                                       │
│ - TypeScript syntax valid                                             │
│ - Warnings: None                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Execution Sandbox                                                    │
│ - Creates branch: ai-dev/feature/save-progress-1234567890            │
│ - Pushes 3 files: routes.ts, db.ts, user-progress.test.ts            │
│ - Creates draft PR with review checklist                             │
│ - CI checks: Running... (passed)                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│ Result                                                               │
│ ✅ Success! PR created: github.com/devprep/devprep/pull/123          │
│ 📁 3 files changed                                                   │
│ ⏱️ Duration: 45 seconds                                              │
│ 👤 Human review required before merge                                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 10. Safety Guarantees

| Guarantee | Implementation |
|-----------|----------------|
| **No direct main branch changes** | All changes go through branch + PR |
| **No code execution** | AI only generates code, doesn't run it |
| **No secrets exposure** | Forbidden patterns detected |
| **No breaking changes** | Constraint enforcement + CI checks |
| **Full audit trail** | Every action logged to bot_ledger |
| **Human approval required** | All PRs start as draft |
| **Rollback capability** | Git history preserved |

---

## 11. Future Enhancements

### Phase 2: Enhanced Capabilities
- [ ] Multi-file atomic changes (all-or-nothing commits)
- [ ] Self-healing: AI can fix failing tests it creates
- [ ] Performance analysis: AI can profile and optimize code

### Phase 3: Proactive Development
- [ ] Automated code review comments
- [ ] Proactive bug detection based on error patterns
- [ ] Automated dependency updates with compatibility checks

### Phase 4: Learning & Improvement
- [ ] Track which patterns succeed vs fail
- [ ] Learn from code review feedback
- [ ] Personalized code style based on codebase history

---

## 12. Implementation Priority

| Phase | Component | Effort | Impact |
|-------|-----------|--------|--------|
| 1 | Task Parser + Context Builder | Medium | Foundation |
| 1 | Code Generator (Claude integration) | Medium | Core feature |
| 2 | Safety Guardrails | Low | Risk mitigation |
| 2 | Execution Sandbox (GitHub integration) | Medium | Required for deployment |
| 3 | CLI Interface | Low | Usability |
| 3 | Message Bus Integration | Low | System integration |

---

## 13. Open Questions

1. **Rate limiting**: How many tasks can run concurrently?
2. **Cost management**: Budget for Claude API calls?
3. **Fallback model**: What if Claude is unavailable?
4. **Task complexity limits**: Max files per task?
5. **Review workflow**: Auto-assign reviewers to PRs?

---

## 14. References

- Replit Agent Architecture: https://blog.replit.com/agent/
- Claude Code: https://docs.anthropic.com/en/docs/claude-code
- inference.sh CLI: https://inference.sh/docs
- GitHub Actions API: https://docs.github.com/en/rest/actions

---

*This specification is a working document and will be updated as implementation progresses.*
