export interface SafetyCheck {
  name: string;
  passed: boolean;
  message: string;
  severity: 'error' | 'warning';
}

export class SafetyGuardrails {
  private forbiddenPatterns: RegExp[] = [
    /DROP\s+TABLE/i,
    /DELETE\s+FROM.*WHERE\s+1\s*=\s*1/i,
    /TRUNCATE/i,
    /password\s*=\s*["'][^"']{8,}/i,
    /api[_-]?key\s*=\s*["'][^"']{20,}/i,
    /secret\s*=\s*["'][^"']{20,}/i,
    /eval\s*\(/,
    /new\s+Function\s*\(/,
    /exec\s*\(/,
    /console\.log\(.*\.(env|config|secret)/i,
  ];

  private readonly MAX_FILE_SIZE = 50000;
  private readonly MAX_FILES_IN_CHANGE = 20;

  async validate(changes: { path: string; content: string; action: string }[]): Promise<SafetyCheck[]> {
    const checks: SafetyCheck[] = [];

    checks.push(...this.checkForbiddenPatterns(changes));
    checks.push(...this.checkFileSizes(changes));
    checks.push(this.checkFileCount(changes));
    checks.push(...this.validateFilePaths(changes));

    return checks;
  }

  private checkForbiddenPatterns(changes: { path: string; content: string }[]): SafetyCheck[] {
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

  private checkFileSizes(changes: { path: string; content: string }[]): SafetyCheck[] {
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

  private checkFileCount(changes: unknown[]): SafetyCheck {
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

  private validateFilePaths(changes: { path: string }[]): SafetyCheck[] {
    const checks: SafetyCheck[] = [];
    const allowedDirs = ['client/src/', 'server/', 'shared/', 'script/', 'packages/'];
    const forbiddenDirs = ['.env', 'node_modules/', 'dist/', '.git/'];

    for (const change of changes) {
      const inAllowedDir = allowedDirs.some(dir => change.path.startsWith(dir));
      
      if (!inAllowedDir) {
        checks.push({
          name: 'invalid_path',
          passed: false,
          message: `File ${change.path} is not in an allowed directory`,
          severity: 'error',
        });
      }

      const inForbiddenDir = forbiddenDirs.some(dir => change.path.includes(dir));

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

  getBlockingErrors(checks: SafetyCheck[]): SafetyCheck[] {
    return checks.filter(c => c.severity === 'error' && !c.passed);
  }

  getWarnings(checks: SafetyCheck[]): SafetyCheck[] {
    return checks.filter(c => c.severity === 'warning' || !c.passed);
  }
}

export const safetyGuardrails = new SafetyGuardrails();
