import type { DevTask } from './task-parser';

export interface GenerationRequest {
  task: DevTask;
  context: string;
  files: Map<string, string>;
}

export interface GenerationResult {
  success: boolean;
  changes: FileChange[];
  explanations: string[];
  tests?: TestChanges;
  warnings?: string[];
  error?: string;
}

export interface FileChange {
  path: string;
  action: 'create' | 'modify';
  content: string;
  diff?: string;
  reason: string;
}

export interface TestChanges {
  additions: string[];
  modifications: string[];
  newTestFiles: FileChange[];
}

export class CodeGenerator {
  private model: string;
  private apiKey: string;
  private readonly TIMEOUT_MS = 120000;

  constructor(model: string = 'claude-sonnet-4-6-20250514') {
    this.model = model;
    this.apiKey = process.env.ANTHROPIC_API_KEY || '';
  }

  async generate(request: GenerationRequest): Promise<GenerationResult> {
    if (!this.apiKey) {
      return {
        success: false,
        changes: [],
        explanations: [],
        error: 'ANTHROPIC_API_KEY environment variable not set. Please set it to use Claude.',
      };
    }

    try {
      const prompt = this.buildPrompt(request);
      const response = await this.callClaudeAPI(prompt);
      return this.parseResponse(response, request);
    } catch (error) {
      return {
        success: false,
        changes: [],
        explanations: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private buildPrompt(request: GenerationRequest): string {
    const { task, context, files } = request;
    
    return `You are the DevPrep AI Development Agent. Generate code to implement the following task.

## TASK
Type: ${task.type}
Priority: ${task.priority}
Title: ${task.title}
Description: ${task.description}
${task.targetFiles ? `Target Files: ${task.targetFiles.join(', ')}` : ''}
${task.targetDirectory ? `Target Directory: ${task.targetDirectory}` : ''}

## CONSTRAINTS
${task.constraints.noBreakingChanges ? '- MUST NOT break existing functionality' : ''}
${task.constraints.testRequired ? '- MUST include tests' : ''}
${task.constraints.backwardCompatible ? '- MUST be backward compatible' : ''}
${task.constraints.languages ? `- Languages: ${task.constraints.languages.join(', ')}` : ''}
${task.constraints.frameworks ? `- Frameworks: ${task.constraints.frameworks.join(', ')}` : ''}

## PROJECT CONTEXT
${context}

## EXISTING CODE TO UNDERSTAND
${this.formatFiles(files)}

## INSTRUCTIONS
1. Read all existing code carefully
2. Follow existing patterns and conventions exactly
3. Generate complete, working code - no placeholders or TODO comments
4. For modifications, provide the complete new file content
5. For new files, provide the complete file content
6. Include appropriate TypeScript types
7. Add error handling where needed
8. Use existing naming conventions and file structure
${task.constraints.testRequired ? '9. Include unit tests following existing test patterns' : ''}

## OUTPUT FORMAT
Return ONLY a JSON object with no additional text:
\`\`\`json
{
  "changes": [
    {
      "path": "relative/path/to/file.ts",
      "action": "create|modify",
      "content": "full file content or diff",
      "reason": "brief explanation of this change"
    }
  ],
  "explanations": ["explanation 1", "explanation 2"],
  "tests": {
    "additions": ["test description 1"],
    "modifications": ["test modification 1"]
  },
  "warnings": ["any potential issues to be aware of"]
}
\`\`\``;
  }

  private formatFiles(files: Map<string, string>): string {
    let output = '';
    
    files.forEach((content, filePath) => {
      output += '\n=== FILE: ' + filePath + ' ===\n';
      output += content;
      output += '\n=== END FILE ===\n';
    });
    
    return output || 'No existing files to read';
  }

  private async callClaudeAPI(prompt: string): Promise<string> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: 8192,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error('Claude API error: ' + response.status + ' ' + errorText);
    }

    const data = await response.json() as { content: Array<{ type: string; text?: string }> };
    
    const textContent = data.content.find(c => c.type === 'text');
    if (!textContent || !textContent.text) {
      throw new Error('No text content in Claude response');
    }

    return textContent.text;
  }

  private parseResponse(response: string, request: GenerationRequest): GenerationResult {
    try {
      const jsonMatch = response.match(/```json\s*([\s\S]*?)\s*```/) || response.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        return {
          success: false,
          changes: [],
          explanations: [],
          error: 'Could not parse JSON response from Claude. Response:\n' + response.substring(0, 500),
        };
      }

      const jsonStr = jsonMatch[1] || jsonMatch[0];
      const parsed = JSON.parse(jsonStr);

      const changes: FileChange[] = (parsed.changes || []).map((change: any) => ({
        path: change.path,
        action: change.action || 'create',
        content: change.content || change.diff || '',
        reason: change.reason || '',
      }));

      const warnings = parsed.warnings || [];
      
      if (request.task.type === 'bugfix' && changes.length === 0) {
        warnings.push('Bug fix task generated no changes - this may indicate insufficient context');
      }

      return {
        success: true,
        changes,
        explanations: parsed.explanations || [],
        tests: parsed.tests ? {
          additions: parsed.tests.additions || [],
          modifications: parsed.tests.modifications || [],
          newTestFiles: (parsed.tests.newTestFiles || []).map((f: any) => ({
            path: f.path,
            action: 'create' as const,
            content: f.content,
            reason: f.reason || 'Test file',
          })),
        } : undefined,
        warnings,
      };
    } catch (error) {
      return {
        success: false,
        changes: [],
        explanations: [],
        error: 'Failed to parse Claude response: ' + (error instanceof Error ? error.message : String(error)) + '\nResponse: ' + response.substring(0, 500),
      };
    }
  }

  setModel(model: string): void {
    this.model = model;
  }

  getModel(): string {
    return this.model;
  }
}

export const codeGenerator = new CodeGenerator();
