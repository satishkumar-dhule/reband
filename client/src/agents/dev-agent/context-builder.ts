import * as fs from 'fs';
import * as path from 'path';
import type { DevTask, TaskContext } from './task-parser';

export interface CodebaseContext {
  structure: ProjectStructure;
  dependencies: DependencyGraph;
  patterns: CodingPatterns;
  history: ChangeHistory;
}

export interface ProjectStructure {
  root: string;
  src: {
    client: string;
    server: string;
    shared: string;
    agents: string;
    components: string;
  };
  config: {
    tsconfig: string;
    packageJson: string;
    tailwind?: string;
  };
}

export interface DependencyGraph {
  packages: Record<string, string[]>;
  imports: Record<string, string[]>;
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

export interface APIPattern {
  method: string;
  path: string;
  handler: string;
}

export interface StatePattern {
  name: string;
  description: string;
  example: string;
}

export interface TestPattern {
  framework: string;
  structure: string;
  example: string;
}

export interface ChangeHistory {
  recentCommits: CommitInfo[];
  modifiedFiles: string[];
}

export interface CommitInfo {
  hash: string;
  message: string;
  date: string;
  author: string;
}

export class ContextBuilder {
  private readonly MAX_CONTEXT_SIZE = 50000;
  private readonly MAX_FILES = 10;

  async build(task: DevTask): Promise<CodebaseContext> {
    return {
      structure: await this.analyzeStructure(),
      dependencies: await this.analyzeDependencies(),
      patterns: await this.extractPatterns(),
      history: await this.getRecentHistory(),
    };
  }

  async getRelevantContext(task: DevTask): Promise<string> {
    const context = await this.build(task);
    
    return `
PROJECT STRUCTURE:
${this.formatStructure(context.structure)}

CODING PATTERNS:
${this.formatPatterns(context.patterns)}

RECENT CHANGES:
${this.formatHistory(context.history)}

TASK CONSTRAINTS:
- Type: ${task.type}
- Languages: ${task.constraints.languages?.join(', ') || 'any'}
- Frameworks: ${task.constraints.frameworks?.join(', ') || 'any'}
- No breaking changes: ${task.constraints.noBreakingChanges}
- Tests required: ${task.constraints.testRequired}
- Backward compatible: ${task.constraints.backwardCompatible}
`;
  }

  async loadRelevantFiles(task: DevTask): Promise<Map<string, string>> {
    const files = new Map<string, string>();
    const fileList = [
      ...task.context.relevantFiles,
      ...(task.targetFiles || []),
    ];

    const uniqueFiles = Array.from(new Set(fileList)).slice(0, this.MAX_FILES);

    for (const filePath of uniqueFiles) {
      try {
        const fullPath = this.resolvePath(filePath);
        if (fs.existsSync(fullPath)) {
          const content = await this.readFileWithLimit(fullPath);
          files.set(filePath, content);
        }
      } catch (error) {
        console.warn(`Could not read file: ${filePath}`);
      }
    }

    return files;
  }

  private async analyzeStructure(): Promise<ProjectStructure> {
    const root = process.cwd();
    
    return {
      root,
      src: {
        client: 'client/src',
        server: 'server',
        shared: 'shared',
        agents: 'client/src/agents',
        components: 'client/src/components',
      },
      config: {
        tsconfig: 'tsconfig.json',
        packageJson: 'package.json',
        tailwind: fs.existsSync('tailwind.config.js') ? 'tailwind.config.js' : undefined,
      },
    };
  }

  private async analyzeDependencies(): Promise<DependencyGraph> {
    const packages: Record<string, string[]> = {};
    
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      try {
        const content = fs.readFileSync(packageJsonPath, 'utf-8');
        const pkg = JSON.parse(content);
        packages.dependencies = Object.keys(pkg.dependencies || {});
        packages.devDependencies = Object.keys(pkg.devDependencies || {});
      } catch {
        // Ignore parse errors
      }
    }

    const clientPackagePath = path.join(process.cwd(), 'client/package.json');
    if (fs.existsSync(clientPackagePath)) {
      try {
        const content = fs.readFileSync(clientPackagePath, 'utf-8');
        const pkg = JSON.parse(content);
        packages['client:dependencies'] = Object.keys(pkg.dependencies || {});
      } catch {
        // Ignore parse errors
      }
    }

    return { packages, imports: {} };
  }

  private async extractPatterns(): Promise<CodingPatterns> {
    return {
      componentPatterns: await this.findComponentPatterns(),
      apiPatterns: await this.findApiPatterns(),
      statePatterns: await this.findStatePatterns(),
      testPatterns: await this.findTestPatterns(),
    };
  }

  private async findComponentPatterns(): Promise<ComponentPattern[]> {
    const patterns: ComponentPattern[] = [];
    const componentsDir = path.join(process.cwd(), 'client/src/components');

    if (fs.existsSync(componentsDir)) {
      const files = this.findFiles(componentsDir, ['.tsx'], 5);
      for (const file of files) {
        const content = await this.readFileWithLimit(file);
        if (content.includes('export default') || content.includes('export const')) {
          const name = path.basename(file, '.tsx');
          patterns.push({
            name,
            template: this.extractComponentTemplate(content),
            example: file,
          });
        }
      }
    }

    return patterns.slice(0, 10);
  }

  private async findApiPatterns(): Promise<APIPattern[]> {
    const patterns: APIPattern[] = [];
    const routesDir = path.join(process.cwd(), 'server/routes');

    if (fs.existsSync(routesDir)) {
      const files = this.findFiles(routesDir, ['.ts'], 10);
      for (const file of files) {
        const content = await this.readFileWithLimit(file);
        const httpMethods = ['get', 'post', 'put', 'patch', 'delete'];
        for (const method of httpMethods) {
          if (content.includes(`${method}(`)) {
            patterns.push({
              method: method.toUpperCase(),
              path: this.extractRoutePath(content, method),
              handler: file,
            });
          }
        }
      }
    }

    return patterns.slice(0, 10);
  }

  private async findStatePatterns(): Promise<StatePattern[]> {
    const patterns: StatePattern[] = [];
    
    const storeFiles = this.findFiles(
      path.join(process.cwd(), 'client/src'),
      ['.ts'],
      20
    ).filter(f => f.includes('store') || f.includes('context') || f.includes('hook'));

    for (const file of storeFiles.slice(0, 5)) {
      const content = await this.readFileWithLimit(file);
      patterns.push({
        name: path.basename(file, '.ts'),
        description: 'State management pattern',
        example: file,
      });
    }

    return patterns;
  }

  private async findTestPatterns(): Promise<TestPattern[]> {
    const patterns: TestPattern[] = [];
    
    const testFiles = this.findFiles(
      path.join(process.cwd(), 'client'),
      ['.test.ts', '.test.tsx', '.spec.ts', '.test.js'],
      10
    );

    for (const file of testFiles.slice(0, 5)) {
      const content = await this.readFileWithLimit(file);
      const framework = this.detectTestFramework(content);
      patterns.push({
        framework,
        structure: this.extractTestStructure(content),
        example: file,
      });
    }

    return patterns;
  }

  private async getRecentHistory(): Promise<ChangeHistory> {
    let recentCommits: CommitInfo[] = [];
    let modifiedFiles: string[] = [];

    try {
      const { execSync } = require('child_process');
      
      const logOutput = execSync('git log --oneline -10', { encoding: 'utf-8' });
      recentCommits = logOutput
        .split('\n')
        .filter(Boolean)
        .map((line: string) => {
          const [hash, ...msgParts] = line.split(' ');
          return {
            hash,
            message: msgParts.join(' '),
            date: new Date().toISOString(),
            author: 'unknown',
          };
        });

      const diffOutput = execSync('git diff --name-only HEAD~5..HEAD', { encoding: 'utf-8' });
      modifiedFiles = diffOutput.split('\n').filter(Boolean);
    } catch {
      // Git commands might fail in some environments
    }

    return { recentCommits, modifiedFiles };
  }

  private formatStructure(structure: ProjectStructure): string {
    return `
DevPrep Project Structure:
- Root: ${structure.root}
- Client Source: ${structure.src.client}/
- Server: ${structure.src.server}/
- Shared: ${structure.src.shared}/
- Agents: ${structure.src.agents}/
- Components: ${structure.src.components}/
`;
  }

  private formatPatterns(patterns: CodingPatterns): string {
    let output = '\nCOMPONENT PATTERNS:\n';
    for (const pattern of patterns.componentPatterns.slice(0, 3)) {
      output += `- ${pattern.name}: ${pattern.example}\n`;
    }

    output += '\nAPI PATTERNS:\n';
    for (const pattern of patterns.apiPatterns.slice(0, 3)) {
      output += `- ${pattern.method} ${pattern.path} -> ${pattern.handler}\n`;
    }

    output += '\nTEST PATTERNS:\n';
    for (const pattern of patterns.testPatterns.slice(0, 3)) {
      output += `- Framework: ${pattern.framework}\n`;
    }

    return output;
  }

  private formatHistory(history: ChangeHistory): string {
    let output = '\nRECENT COMMITS:\n';
    for (const commit of history.recentCommits.slice(0, 5)) {
      output += `- ${commit.hash} ${commit.message}\n`;
    }

    if (history.modifiedFiles.length > 0) {
      output += '\nRECENTLY MODIFIED:\n';
      for (const file of history.modifiedFiles.slice(0, 10)) {
        output += `- ${file}\n`;
      }
    }

    return output;
  }

  private resolvePath(filePath: string): string {
    if (path.isAbsolute(filePath)) {
      return filePath;
    }
    return path.join(process.cwd(), filePath);
  }

  private async readFileWithLimit(filePath: string): Promise<string> {
    const content = fs.readFileSync(filePath, 'utf-8');
    if (content.length > this.MAX_CONTEXT_SIZE) {
      return content.substring(0, this.MAX_CONTEXT_SIZE) + '\n... [truncated]';
    }
    return content;
  }

  private findFiles(dir: string, extensions: string[], maxFiles: number): string[] {
    const files: string[] = [];
    
    try {
      const walk = (currentDir: string) => {
        if (files.length >= maxFiles) return;
        
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });
        for (const entry of entries) {
          if (files.length >= maxFiles) break;
          
          const fullPath = path.join(currentDir, entry.name);
          
          if (entry.isDirectory()) {
            if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
              walk(fullPath);
            }
          } else if (extensions.some(ext => entry.name.endsWith(ext))) {
            files.push(fullPath);
          }
        }
      };
      
      walk(dir);
    } catch {
      // Directory might not exist
    }
    
    return files;
  }

  private extractComponentTemplate(content: string): string {
    const hooks = content.match(/use\w+/g) || [];
    const hasState = content.includes('useState');
    const hasEffect = content.includes('useEffect');
    
    return `React component with: ${hooks.join(', ')}${hasState ? ', useState' : ''}${hasEffect ? ', useEffect' : ''}`;
  }

  private extractRoutePath(content: string, method: string): string {
    const match = content.match(new RegExp(`${method}\\(['\"]([^'\"]+)['\"]`));
    return match ? match[1] : '/unknown';
  }

  private detectTestFramework(content: string): string {
    if (content.includes('@testing-library')) return 'Testing Library';
    if (content.includes('jest')) return 'Jest';
    if (content.includes('vitest')) return 'Vitest';
    if (content.includes('playwright')) return 'Playwright';
    if (content.includes('mocha') || content.includes('chai')) return 'Mocha/Chai';
    return 'Unknown';
  }

  private extractTestStructure(content: string): string {
    const describes = content.match(/describe\(['"]([^'"]+)['"]/g) || [];
    return `Tests: ${describes.slice(0, 3).join(', ')}`;
  }
}

export const contextBuilder = new ContextBuilder();
