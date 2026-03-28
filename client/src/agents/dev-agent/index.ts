import * as fs from 'fs';
import * as path from 'path';
import { TaskParser, taskParser, type DevTask, type TaskInput } from './task-parser';
import { ContextBuilder, contextBuilder } from './context-builder';
import { CodeGenerator, codeGenerator, type FileChange } from './code-generator';
import { SafetyGuardrails, safetyGuardrails, type SafetyCheck } from './guardrails';

export interface DevAgentResult {
  success: boolean;
  taskId: string;
  changes?: FileChange[];
  explanations?: string[];
  warnings?: string[];
  safetyWarnings?: SafetyCheck[];
  errors: string[];
  duration?: number;
}

export class DevPrepDevAgent {
  private taskParser: TaskParser;
  private contextBuilder: ContextBuilder;
  private codeGenerator: CodeGenerator;
  private safetyGuardrails: SafetyGuardrails;

  constructor(
    parser?: TaskParser,
    builder?: ContextBuilder,
    generator?: CodeGenerator,
    guardrails?: SafetyGuardrails
  ) {
    this.taskParser = parser || taskParser;
    this.contextBuilder = builder || contextBuilder;
    this.codeGenerator = generator || codeGenerator;
    this.safetyGuardrails = guardrails || safetyGuardrails;
  }

  async executeTask(taskInput: TaskInput): Promise<DevAgentResult> {
    const taskId = this.generateTaskId();
    const startTime = Date.now();

    this.log(`[DevAgent] Starting task: ${taskId}`);

    try {
      const task = this.taskParser.parse(taskInput);
      this.log(`[DevAgent] Parsed task: ${task.title} (${task.type})`);

      const context = await this.contextBuilder.getRelevantContext(task);
      const files = await this.contextBuilder.loadRelevantFiles(task);
      this.log(`[DevAgent] Built context with ${files.size} files`);

      const generationResult = await this.codeGenerator.generate({
        task,
        context,
        files,
      });

      if (!generationResult.success) {
        return {
          success: false,
          taskId,
          errors: [generationResult.error || 'Code generation failed'],
          duration: Date.now() - startTime,
        };
      }

      this.log(`[DevAgent] Generated ${generationResult.changes.length} changes`);

      if (generationResult.changes.length === 0) {
        return {
          success: false,
          taskId,
          errors: ['No code changes were generated'],
          warnings: generationResult.warnings,
          duration: Date.now() - startTime,
        };
      }

      const safetyChecks = await this.safetyGuardrails.validate(generationResult.changes);
      const blockingErrors = this.safetyGuardrails.getBlockingErrors(safetyChecks);

      if (blockingErrors.length > 0) {
        this.log(`[DevAgent] Safety checks failed: ${blockingErrors.length} errors`);
        return {
          success: false,
          taskId,
          errors: blockingErrors.map((e: SafetyCheck) => e.message),
          safetyWarnings: this.safetyGuardrails.getWarnings(safetyChecks),
          duration: Date.now() - startTime,
        };
      }

      this.log(`[DevAgent] Safety checks passed`);

      const warnings = [
        ...(generationResult.warnings || []),
        ...this.safetyGuardrails.getWarnings(safetyChecks).map((w: SafetyCheck) => w.message),
      ];

      return {
        success: true,
        taskId,
        changes: generationResult.changes,
        explanations: generationResult.explanations,
        warnings: warnings.length > 0 ? warnings : undefined,
        safetyWarnings: safetyChecks,
        errors: [],
        duration: Date.now() - startTime,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.log(`[DevAgent] Task failed: ${errorMessage}`);
      
      return {
        success: false,
        taskId,
        errors: [errorMessage],
        duration: Date.now() - startTime,
      };
    }
  }

  async previewTask(taskInput: TaskInput): Promise<{
    task: DevTask;
    estimatedChanges: number;
    targetFiles: string[];
  }> {
    const task = this.taskParser.parse(taskInput);
    const files = await this.contextBuilder.loadRelevantFiles(task);

    return {
      task,
      estimatedChanges: files.size + 2,
      targetFiles: Array.from(files.keys()),
    };
  }

  async dryRun(taskInput: TaskInput): Promise<string> {
    const preview = await this.previewTask(taskInput);
    
    return `
Task Preview
=============
ID: ${preview.task.id}
Type: ${preview.task.type}
Priority: ${preview.task.priority}
Title: ${preview.task.title}

Description:
${preview.task.description}

Constraints:
- No breaking changes: ${preview.task.constraints.noBreakingChanges}
- Tests required: ${preview.task.constraints.testRequired}
- Backward compatible: ${preview.task.constraints.backwardCompatible}
${preview.task.constraints.languages ? `- Languages: ${preview.task.constraints.languages.join(', ')}` : ''}

Target Files:
${preview.targetFiles.length > 0 ? preview.targetFiles.map(f => `  - ${f}`).join('\n') : '  (auto-detect)'}

Estimated Changes: ~${preview.estimatedChanges} files
`;
  }

  applyChangesLocally(changes: FileChange[], basePath: string = process.cwd()): {
    success: boolean;
    applied: string[];
    errors: string[];
  } {
    const applied: string[] = [];
    const errors: string[] = [];

    for (const change of changes) {
      try {
        const fullPath = path.join(basePath, change.path);
        const dir = path.dirname(fullPath);

        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }

        if (change.action === 'create') {
          fs.writeFileSync(fullPath, change.content, 'utf-8');
          applied.push(change.path);
        } else if (change.action === 'modify') {
          if (fs.existsSync(fullPath)) {
            const existing = fs.readFileSync(fullPath, 'utf-8');
            if (change.diff) {
              fs.writeFileSync(fullPath, this.applyDiff(existing, change.diff), 'utf-8');
            } else {
              fs.writeFileSync(fullPath, change.content, 'utf-8');
            }
            applied.push(change.path);
          } else {
            errors.push(`File does not exist: ${change.path}`);
          }
        }
      } catch (error) {
        errors.push(`Failed to apply ${change.path}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    return {
      success: errors.length === 0,
      applied,
      errors,
    };
  }

  private applyDiff(original: string, diff: string): string {
    const lines = original.split('\n');
    const diffLines = diff.split('\n');
    
    let result = [...lines];
    let currentIndex = 0;

    for (const line of diffLines) {
      if (line.startsWith('@@')) {
        const match = line.match(/@@ -(\d+)/);
        if (match) {
          currentIndex = parseInt(match[1], 10) - 1;
        }
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        if (result[currentIndex] === line.substring(1)) {
          result.splice(currentIndex, 1);
        } else {
          currentIndex++;
        }
      } else if (line.startsWith('+') && !line.startsWith('+++')) {
        result.splice(currentIndex, 0, line.substring(1));
        currentIndex++;
      } else if (!line.startsWith('+++') && !line.startsWith('---')) {
        currentIndex++;
      }
    }

    return result.join('\n');
  }

  private log(message: string): void {
    console.log(`[${new Date().toISOString()}] ${message}`);
  }

  private generateTaskId(): string {
    return `dev-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

export const devAgent = new DevPrepDevAgent();
