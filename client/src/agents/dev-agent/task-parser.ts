export interface DevTask {
  id: string;
  type: 'feature' | 'bugfix' | 'refactor' | 'test' | 'improvement';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  targetFiles?: string[];
  targetDirectory?: string;
  constraints: TaskConstraints;
  context: TaskContext;
}

export interface TaskConstraints {
  languages?: string[];
  frameworks?: string[];
  noBreakingChanges: boolean;
  testRequired: boolean;
  backwardCompatible: boolean;
}

export interface TaskContext {
  relevantFiles: string[];
  recentChanges?: string[];
  relatedComponents?: string[];
  testFiles?: string[];
}

export type TaskInput = 
  | { type: 'text'; content: string }
  | { type: 'issue'; issueId: string }
  | { type: 'api'; endpoint: string; changes: string[] };

export class TaskParser {
  private readonly TASK_TYPE_PATTERNS = {
    feature: /\b(add|create|implement|build|introduce|new)\b/i,
    bugfix: /\b(fix|bug|issue|problem|error|crash|broken|not working|failed)\b/i,
    refactor: /\b(refactor|restructure|reorganize|clean up|simplify|optimize)\b/i,
    test: /\b(test|spec|coverage|unit test|integration test)\b/i,
    improvement: /\b(improve|enhance|upgrade|update|better|faster)\b/i,
  };

  private readonly PRIORITY_PATTERNS = {
    critical: /\b(critical|urgent|asap|emergency|must have|blocking)\b/i,
    high: /\b(high|important|priority|soon)\b/i,
    medium: /\b(medium|normal|standard)\b/i,
    low: /\b(low|nice to have|optional|when possible)\b/i,
  };

  private readonly FILE_PATTERNS = [
    /in\s+([\w\/\-\.]+\.(ts|tsx|js|jsx))/gi,
    /file[s]?\s+([\w\/\-\.]+\.(ts|tsx|js|jsx))/gi,
    /under\s+([\w\/\-\.]+)/gi,
    /directory\s+([\w\/\-\.]+)/gi,
  ];

  private readonly LANGUAGE_MAP: Record<string, string[]> = {
    typescript: ['ts', 'tsx'],
    javascript: ['js', 'jsx'],
    python: ['py'],
    rust: ['rs'],
    go: ['go'],
  };

  parse(input: TaskInput): DevTask {
    if (input.type === 'text') {
      return this.parseTextInput(input.content);
    } else if (input.type === 'issue') {
      return this.parseIssueInput(input.issueId);
    } else if (input.type === 'api') {
      return this.parseApiInput(input.endpoint, input.changes);
    }
    throw new Error(`Unknown input type`);
  }

  private parseTextInput(content: string): DevTask {
    const id = this.generateId();
    const type = this.detectType(content);
    const priority = this.detectPriority(content);
    const targetFiles = this.extractFilePaths(content);
    const targetDirectory = this.extractDirectory(content);
    const constraints = this.buildConstraints(content, type);
    const { relevantFiles, testFiles } = this.findRelatedFiles(targetFiles, targetDirectory);

    return {
      id,
      type,
      priority,
      title: this.extractTitle(content),
      description: this.sanitizeDescription(content),
      targetFiles: targetFiles.length > 0 ? targetFiles : undefined,
      targetDirectory,
      constraints,
      context: {
        relevantFiles,
        testFiles,
      },
    };
  }

  private detectType(content: string): DevTask['type'] {
    for (const [type, pattern] of Object.entries(this.TASK_TYPE_PATTERNS)) {
      if (pattern.test(content)) {
        return type as DevTask['type'];
      }
    }
    return 'feature';
  }

  private detectPriority(content: string): DevTask['priority'] {
    for (const [priority, pattern] of Object.entries(this.PRIORITY_PATTERNS)) {
      if (pattern.test(content)) {
        return priority as DevTask['priority'];
      }
    }
    return 'medium';
  }

  private extractFilePaths(content: string): string[] {
    const files: Set<string> = new Set();
    
    for (const pattern of this.FILE_PATTERNS) {
      const matches = Array.from(content.matchAll(pattern));
      for (const match of matches) {
        if (match[1]) {
          const normalizedPath = this.normalizeFilePath(match[1]);
          if (this.isValidFilePath(normalizedPath)) {
            files.add(normalizedPath);
          }
        }
      }
    }
    
    return Array.from(files);
  }

  private extractDirectory(content: string): string | undefined {
    const dirPatterns = [
      /in\s+the?\s+([\w\/\-\.]+\/)/gi,
      /under\s+([\w\/\-\.]+\/)/gi,
      /directory\s+([\w\/\-\.]+\/)/gi,
      /folder\s+([\w\/\-\.]+\/)/gi,
    ];

    for (const pattern of dirPatterns) {
      const match = pattern.exec(content);
      if (match && match[1]) {
        return this.normalizeDirectoryPath(match[1]);
      }
      pattern.lastIndex = 0;
    }

    return undefined;
  }

  private buildConstraints(content: string, type: DevTask['type']): TaskConstraints {
    const languages = this.detectLanguages(content);
    const frameworks = this.detectFrameworks(content);

    return {
      languages: languages.length > 0 ? languages : undefined,
      frameworks: frameworks.length > 0 ? frameworks : undefined,
      noBreakingChanges: !/\b(breaking|breaking change|major|rewrite)\b/i.test(content),
      testRequired: /\b(test|spec)\b/i.test(content) || type === 'test' || type === 'bugfix',
      backwardCompatible: !/\b(breaking|major|breaking change)\b/i.test(content),
    };
  }

  private detectLanguages(content: string): string[] {
    const languages: string[] = [];
    const contentLower = content.toLowerCase();

    for (const [lang, extensions] of Object.entries(this.LANGUAGE_MAP)) {
      if (contentLower.includes(lang)) {
        languages.push(lang);
      } else if (extensions.some(ext => content.includes(`.${ext}`))) {
        languages.push(lang);
      }
    }

    return languages;
  }

  private detectFrameworks(content: string): string[] {
    const frameworks: string[] = [];
    const frameworkPatterns = [
      'react', 'vue', 'angular', 'next', 'nextjs', 'svelte',
      'express', 'fastify', 'nestjs', 'node',
      'tailwind', 'mui', 'chakra',
      'prisma', 'drizzle', 'sequelize',
      'jest', 'vitest', 'playwright', 'testing-library',
    ];

    const contentLower = content.toLowerCase();
    for (const framework of frameworkPatterns) {
      if (contentLower.includes(framework)) {
        frameworks.push(framework);
      }
    }

    return frameworks;
  }

  private findRelatedFiles(targetFiles: string[], targetDirectory?: string): {
    relevantFiles: string[];
    testFiles: string[];
  } {
    const relevantFiles: Set<string> = new Set(targetFiles);
    const testFiles: Set<string> = new Set();

    if (targetDirectory) {
      const dirFiles = this.scanDirectory(targetDirectory);
      dirFiles.forEach((f: string) => {
        relevantFiles.add(f);
        if (f.includes('.test.') || f.includes('.spec.')) {
          testFiles.add(f);
        }
      });
    }

    targetFiles.forEach(file => {
      const testFile = this.findTestFile(file);
      if (testFile) {
        testFiles.add(testFile);
      }
    });

    return {
      relevantFiles: Array.from(relevantFiles),
      testFiles: Array.from(testFiles),
    };
  }

  private scanDirectory(dir: string): string[] {
    const files: string[] = [];
    try {
      const { execSync } = require('child_process');
      const output = execSync(`find ${dir} -type f \\( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \\) 2>/dev/null | head -20`, {
        encoding: 'utf-8',
        cwd: process.cwd(),
      });
      output.split('\n').filter(Boolean).forEach((f: string) => files.push(f));
    } catch {
      // Directory might not exist or be empty
    }
    return files;
  }

  private findTestFile(sourceFile: string): string | null {
    const basePath = sourceFile.replace(/\.(ts|tsx|js|jsx)$/, '');
    const testPatterns = [
      `${basePath}.test.ts`,
      `${basePath}.test.tsx`,
      `${basePath}.spec.ts`,
      `${basePath}.spec.tsx`,
      `${basePath}.test.js`,
      `${basePath}.spec.js`,
    ];

    for (const pattern of testPatterns) {
      try {
        require('fs').accessSync(pattern);
        return pattern;
      } catch {
        // Test file doesn't exist
      }
    }
    return null;
  }

  private extractTitle(content: string): string {
    let title = content
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 100);

    const colonIndex = title.indexOf(':');
    if (colonIndex > 0 && colonIndex < 50) {
      title = title.substring(colonIndex + 1).trim();
    }

    const words = title.split(' ');
    if (words.length > 8) {
      title = words.slice(0, 8).join(' ') + '...';
    }

    return title.charAt(0).toUpperCase() + title.slice(1);
  }

  private sanitizeDescription(content: string): string {
    return content
      .replace(/`[^`]+`/g, '')
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private normalizeFilePath(path: string): string {
    let normalized = path.trim();
    if (!normalized.startsWith('client/') && !normalized.startsWith('server/') && !normalized.startsWith('shared/')) {
      if (normalized.startsWith('src/')) {
        normalized = 'client/' + normalized;
      }
    }
    return normalized;
  }

  private normalizeDirectoryPath(path: string): string {
    let normalized = path.trim();
    if (!normalized.endsWith('/')) {
      normalized += '/';
    }
    if (!normalized.startsWith('client/') && !normalized.startsWith('server/') && !normalized.startsWith('shared/')) {
      if (normalized.startsWith('src/')) {
        normalized = 'client/' + normalized;
      }
    }
    return normalized;
  }

  private isValidFilePath(path: string): boolean {
    const validExtensions = ['.ts', '.tsx', '.js', '.jsx', '.py', '.rs', '.go'];
    return validExtensions.some(ext => path.endsWith(ext)) || path.includes('/');
  }

  private parseIssueInput(issueId: string): DevTask {
    return {
      id: this.generateId(),
      type: 'feature',
      priority: 'medium',
      title: `Issue ${issueId}`,
      description: `Address GitHub issue: ${issueId}`,
      constraints: {
        noBreakingChanges: true,
        testRequired: true,
        backwardCompatible: true,
      },
      context: {
        relevantFiles: [],
      },
    };
  }

  private parseApiInput(endpoint: string, changes: string[]): DevTask {
    return {
      id: this.generateId(),
      type: 'feature',
      priority: 'medium',
      title: `API changes for ${endpoint}`,
      description: `Modify API endpoint: ${endpoint}\nChanges: ${changes.join(', ')}`,
      constraints: {
        noBreakingChanges: true,
        testRequired: true,
        backwardCompatible: true,
      },
      context: {
        relevantFiles: [`server/routes/${endpoint}.ts`],
      },
    };
  }

  private generateId(): string {
    return `dev-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }
}

export const taskParser = new TaskParser();
