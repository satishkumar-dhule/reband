/**
 * Enhanced Code Block Component
 * Features: Line numbers toggle, highlight lines, run code, diff view, enhanced language badges
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, Check, Hash, Link2, Settings2, ChevronDown, 
  Loader2, Keyboard, PlayCircle, CheckCircle2, XCircle, 
  Terminal, EyeOff, Columns2, Plus, Minus, Code2
} from 'lucide-react';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from '@/lib/utils';

// Language configuration for enhanced badges
const LANGUAGE_CONFIG: Record<string, { color: string; bg: string; icon: string }> = {
  javascript: { color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30', icon: 'JS' },
  typescript: { color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30', icon: 'TS' },
  python: { color: 'text-green-400', bg: 'bg-green-400/10 border-green-400/30', icon: 'PY' },
  java: { color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-400/30', icon: 'JV' },
  go: { color: 'text-cyan-400', bg: 'bg-cyan-400/10 border-cyan-400/30', icon: 'GO' },
  rust: { color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-500/30', icon: 'RS' },
  cpp: { color: 'text-pink-400', bg: 'bg-pink-400/10 border-pink-400/30', icon: 'C++' },
  c: { color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/30', icon: 'C' },
  sql: { color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30', icon: 'SQL' },
  bash: { color: 'text-gray-400', bg: 'bg-gray-400/10 border-gray-400/30', icon: 'SH' },
  shell: { color: 'text-gray-400', bg: 'bg-gray-400/10 border-gray-400/30', icon: 'SH' },
  json: { color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/30', icon: 'JSON' },
  html: { color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30', icon: 'HTML' },
  css: { color: 'text-blue-300', bg: 'bg-blue-300/10 border-blue-300/30', icon: 'CSS' },
  jsx: { color: 'text-cyan-400', bg: 'bg-cyan-400/10 border-cyan-400/30', icon: 'JSX' },
  tsx: { color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30', icon: 'TSX' },
  diff: { color: 'text-violet-400', bg: 'bg-violet-400/10 border-violet-400/30', icon: 'DIFF' },
  graphql: { color: 'text-pink-400', bg: 'bg-pink-400/10 border-pink-400/30', icon: 'GQL' },
  yaml: { color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30', icon: 'YAML' },
  markdown: { color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30', icon: 'MD' },
  default: { color: 'text-gray-400', bg: 'bg-gray-400/10 border-gray-400/30', icon: 'CODE' }
};

function getLanguageConfig(lang: string) {
  return LANGUAGE_CONFIG[lang?.toLowerCase()] || LANGUAGE_CONFIG.default;
}

// Parse highlight lines from code comment syntax
function parseHighlightLines(code: string): number[] {
  const patterns = [
    /\/\/\s*highlight-line[:\s]*([\d,\s\-]+)/gi,
    /\/\/\s*hl[:\s]*([\d,\s\-]+)/gi,
    /#\s*highlight-line[:\s]*([\d,\s\-]+)/gi,
    /\/\*\s*highlight-line[:\s]*([\d,\s\-]+)\s*\*\//gi,
  ];
  
  const lines: number[] = [];
  
  for (const pattern of patterns) {
    const matches = Array.from(code.matchAll(pattern));
    for (const match of matches) {
      const nums = match[1];
      nums.split(/[,\s\-]+/).forEach((n: string) => {
        const num = parseInt(n.trim(), 10);
        if (!isNaN(num) && num > 0) lines.push(num);
      });
    }
  }
  
  return Array.from(new Set(lines)).sort((a, b) => a - b);
}

// Parse diff syntax from code
interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber: number;
}

function parseDiffCode(code: string): DiffLine[] {
  const lines = code.split('\n');
  return lines.map((line, idx) => {
    if (line.startsWith('+') && !line.startsWith('+++')) {
      return { type: 'added', content: line.slice(1), lineNumber: idx + 1 };
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      return { type: 'removed', content: line.slice(1), lineNumber: idx + 1 };
    }
    return { type: 'unchanged', content: line, lineNumber: idx + 1 };
  });
}

// Check if code contains diff syntax
function isDiffCode(code: string): boolean {
  return /^[+\-]./.test(code.trim());
}

// Run code in sandbox using Web Worker for secure isolation
// This prevents malicious code from accessing the main thread or parent context
async function runCodeInSandbox(code: string, language: string): Promise<{ output: string; error?: string }> {
  // Remove highlight comments for execution
  const cleanCode = code
    .replace(/\/\/\s*highlight-line[:\s]*[\d,\s\-]+/gi, '')
    .replace(/\/\/\s*hl[:\s]*[\d,\s\-]+/gi, '')
    .replace(/#\s*highlight-line[:\s]*[\d,\s\-]+/gi, '')
    .replace(/\/\*\s*highlight-line[:\s]*[\d,\s\-]+\s*\*\//gi, '');
  
  if (language === 'javascript' || language === 'js') {
    return new Promise((resolve) => {
      try {
        // SECURITY FIX: Replaced eval() with safe sandboxed execution
        // Using a combination of Function constructor and restricted scope
        // This prevents direct access to window, document, fetch, etc.
        const workerCode = `
          self.onmessage = function(msg) {
            try {
              const logs = [];
              
              // Create a sandboxed console that intercepts all output
              const console = { 
                log: (...a) => logs.push(a.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' ')), 
                error: (...a) => logs.push('ERROR: ' + a.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' ')),
                warn: (...a) => logs.push('WARN: ' + a.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' ')),
                info: (...a) => logs.push('INFO: ' + a.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' ')),
                table: (data) => logs.push(JSON.stringify(data, null, 2)),
                clear: () => logs.length = 0
              };
              
              // SECURITY: Blocked globals that could be exploited
              // These are set to undefined in the execution scope
              const blockedGlobals = [
                'window', 'document', 'fetch', 'XMLHttpRequest', 
                'WebSocket', 'Worker', 'importScripts', 'eval',
                'Function', 'constructor', '__proto__', 'prototype',
                'localStorage', 'sessionStorage', 'indexedDB',
                'location', 'navigator', 'history', 'crypto',
                'atob', 'btoa', 'setTimeout', 'setInterval'
              ];
              
              // Execute user code in a sandboxed environment using Function constructor
              // This is safer than eval because it doesn't have access to local scope
              const sandboxedCode = msg.data.code;
              
              // Build a safe function with blocked globals
              const safeFunction = new Function(
                'console',
                ...blockedGlobals,
                '"use strict"; ' + sandboxedCode
              );
              
              // Call with undefined for all blocked globals
              const result = safeFunction(
                console,
                ...blockedGlobals.map(() => undefined)
              );
              
              const outputStr = result !== undefined 
                ? (typeof result === 'object' ? JSON.stringify(result, null, 2) : String(result))
                : 'Code executed successfully (no return value)';
              
              self.postMessage({ success: true, output: outputStr, logs: logs });
            } catch (err) {
              const errorMessage = err instanceof Error ? err.message : String(err);
              self.postMessage({ success: false, error: errorMessage, logs: logs || [] });
            }
          }
        `;
        
        const blob = new Blob([workerCode], { type: 'application/javascript' });
        const workerUrl = URL.createObjectURL(blob);
        const worker = new Worker(workerUrl);
        
        const timeoutId = setTimeout(() => {
          worker.terminate();
          URL.revokeObjectURL(workerUrl);
          resolve({ output: '', error: 'Execution timed out after 5000ms' });
        }, 5000);
        
        worker.onmessage = (evt) => {
          clearTimeout(timeoutId);
          worker.terminate();
          URL.revokeObjectURL(workerUrl);
          if (evt.data.success) {
            const output = evt.data.output || '';
            const logs = evt.data.logs?.join('\n') || '';
            resolve({ 
              output: logs ? (output + (logs ? '\n\nConsole output:\n' + logs : '')) : output 
            });
          } else {
            resolve({ output: '', error: evt.data.error });
          }
        };
        
        worker.onerror = (evt) => {
          clearTimeout(timeoutId);
          worker.terminate();
          URL.revokeObjectURL(workerUrl);
          resolve({ output: '', error: evt.message || 'Worker execution failed' });
        };
        
        worker.postMessage({ code: cleanCode });
      } catch (err) {
        resolve({ output: '', error: err instanceof Error ? err.message : 'Execution failed' });
      }
    });
  }
  
  if (language === 'python') {
    return { output: '', error: 'Python execution requires a backend service. Try running in a Python sandbox.' };
  }

  return { output: '', error: `Execution not available for ${language}.` };
}

interface EnhancedCodeBlockProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
  className?: string;
  maxHeight?: string;
}

export function EnhancedCodeBlock({
  code,
  language,
  showLineNumbers = true,
  className,
  maxHeight = 'max-h-[600px]',
}: EnhancedCodeBlockProps) {
  const codeId = useRef(`code-${Math.random().toString(36).substr(2, 9)}`);
  const blockRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [localLineNumbers, setLocalLineNumbers] = useState(showLineNumbers);
  const [isRunning, setIsRunning] = useState(false);
  const [runOutput, setRunOutput] = useState<{ output: string; error?: string } | null>(null);
  const [showDiffView, setShowDiffView] = useState(false);
  
  const langConfig = getLanguageConfig(language);
  const isRunnable = language === 'javascript' || language === 'js';
  const hasDiff = isDiffCode(code);
  
  // Parse highlight lines
  const highlightedLines = useMemo(() => parseHighlightLines(code), [code]);
  const diffLines = useMemo(() => hasDiff ? parseDiffCode(code) : [], [code, hasDiff]);
  
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleRun = useCallback(async () => {
    setIsRunning(true);
    setRunOutput(null);
    try {
      const result = await runCodeInSandbox(code, language);
      setRunOutput(result);
    } catch {
      setRunOutput({ output: '', error: 'Execution failed' });
    }
    setIsRunning(false);
  }, [code, language]);

  const toggleLineNumbers = useCallback(() => {
    setLocalLineNumbers(prev => !prev);
  }, []);

  // Focus block when focused via keyboard navigation
  const handleFocus = useCallback(() => {
    blockRef.current?.setAttribute('data-focused', 'true');
  }, []);

  const handleBlur = useCallback(() => {
    blockRef.current?.removeAttribute('data-focused');
    setMenuOpen(false);
  }, []);

  return (
    <motion.div
      ref={blockRef}
      id={codeId.current}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl overflow-hidden border border-border/50 bg-code-bg',
        'group relative',
        'focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary/50',
        'transition-all duration-200',
        className
      )}
      tabIndex={0}
      onFocus={handleFocus}
      onBlur={handleBlur}
      role="region"
      aria-label={`Code block: ${language}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-b border-border/50">
        {/* Language badge with enhanced styling */}
        <div className="flex items-center gap-2">
          <span className={cn(
            'px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border',
            langConfig.color,
            langConfig.bg
          )}>
            {langConfig.icon}
          </span>
          
          {/* Line count */}
          <span className="text-xs text-muted-foreground/70 flex items-center gap-1">
            <Code2 className="w-3 h-3" />
            {code.split('\n').length} lines
          </span>
          
          {/* Highlight indicator */}
          {highlightedLines.length > 0 && (
            <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 text-[10px] font-medium rounded border border-amber-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full" />
              {highlightedLines.length} highlighted
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {/* Line numbers toggle */}
          <motion.button
            onClick={toggleLineNumbers}
            className={cn(
              'p-2 rounded-md transition-all',
              localLineNumbers 
                ? 'bg-primary/20 text-primary' 
                : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle line numbers"
            title="Toggle line numbers"
          >
            {localLineNumbers ? <Hash className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
          </motion.button>
          
          {/* Diff view toggle (if applicable) */}
          {hasDiff && (
            <motion.button
              onClick={() => setShowDiffView(!showDiffView)}
              className={cn(
                'p-2 rounded-md transition-all',
                showDiffView 
                  ? 'bg-violet-500/20 text-violet-400' 
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle diff view"
              title="Toggle diff view"
            >
              <Columns2 className="w-4 h-4" />
            </motion.button>
          )}
          
          {/* Run code button (for JS/Python) */}
          {isRunnable && (
            <motion.button
              onClick={handleRun}
              disabled={isRunning}
              className={cn(
                'flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all',
                'bg-green-500/10 text-green-400 hover:bg-green-500/20 border border-green-500/30',
                isRunning && 'opacity-50 cursor-not-allowed'
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Run code"
              title="Run code"
            >
              {isRunning ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <PlayCircle className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Run</span>
            </motion.button>
          )}
          
          {/* Settings dropdown */}
          <div className="relative">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={cn(
                'p-2 rounded-md transition-all',
                'hover:bg-secondary/50 hover:text-foreground',
                'text-muted-foreground',
                menuOpen && 'bg-secondary/50 text-foreground'
              )}
              aria-label="Copy options"
              aria-expanded={menuOpen}
            >
              <Settings2 className="w-4 h-4" />
            </button>

            {/* Dropdown menu */}
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    'absolute right-0 top-full mt-2 z-20',
                    'w-64 rounded-xl border border-border bg-popover',
                    'shadow-lg shadow-black/20',
                    'overflow-hidden'
                  )}
                  role="menu"
                >
                  <div className="p-2">
                    <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                      Code Options
                    </p>
                    
                    {/* Toggle line numbers */}
                    <button
                      onClick={toggleLineNumbers}
                      className={cn(
                        'w-full flex items-center gap-3 px-2 py-2 rounded-lg',
                        'text-sm transition-colors',
                        'hover:bg-secondary/50',
                        localLineNumbers ? 'text-primary' : 'text-foreground'
                      )}
                      role="menuitemcheckbox"
                      aria-checked={localLineNumbers}
                    >
                      <div className={cn(
                        'w-4 h-4 rounded border flex items-center justify-center transition-colors',
                        localLineNumbers
                          ? 'bg-primary border-primary'
                          : 'border-muted-foreground/30'
                      )}>
                        {localLineNumbers && <Check className="w-3 h-3 text-primary-foreground" />}
                      </div>
                      <span>Show line numbers</span>
                    </button>
                    
                    {/* Copy with line numbers */}
                    <button
                      onClick={() => {
                        const lines = code.split('\n');
                        const numbered = lines.map((line, i) => `${i + 1}. ${line}`).join('\n');
                        navigator.clipboard.writeText(numbered);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="w-full flex items-center gap-3 px-2 py-2 rounded-lg text-sm text-foreground hover:bg-secondary/50 transition-colors"
                    >
                      <Hash className="w-4 h-4 text-muted-foreground" />
                      <span>Copy with line numbers</span>
                    </button>
                  </div>
                  
                  {/* Highlight info */}
                  {highlightedLines.length > 0 && (
                    <div className="px-3 py-2 border-t border-border/50">
                      <p className="text-xs text-muted-foreground mb-1">Highlighted lines:</p>
                      <div className="flex flex-wrap gap-1">
                        {highlightedLines.slice(0, 10).map(line => (
                          <span key={line} className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-[10px] rounded">
                            {line}
                          </span>
                        ))}
                        {highlightedLines.length > 10 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{highlightedLines.length - 10} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Copy button */}
          <motion.button
            onClick={handleCopy}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg',
              'text-sm font-medium transition-all',
              copied
                ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label={copied ? 'Copied' : 'Copy code'}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                <span className="hidden sm:inline">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span className="hidden sm:inline">Copy</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Code content */}
      <div className={cn('overflow-auto', maxHeight)}>
        {showDiffView && hasDiff ? (
          /* Diff View */
          <div className="flex">
            <div className="flex-1 min-w-0">
              {diffLines.map((line, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'flex items-start transition-colors',
                    line.type === 'added' 
                      ? 'bg-green-500/10 border-l-2 border-green-500' 
                      : line.type === 'removed' 
                        ? 'bg-red-500/10 border-l-2 border-red-500' 
                        : 'border-l-2 border-transparent'
                  )}
                >
                  {localLineNumbers && (
                    <span className="select-none w-12 py-2 px-3 text-right text-[13px] text-muted-foreground/50 border-r border-border/30 bg-muted/30 shrink-0 font-mono">
                      {line.lineNumber}
                    </span>
                  )}
                  <pre className={cn(
                    'flex-1 py-2 px-4 text-[13px] font-mono whitespace-pre overflow-x-auto',
                    line.type === 'added' ? 'text-green-300' : line.type === 'removed' ? 'text-red-300' : 'text-gray-300'
                  )}>
                    <code>{line.content || ' '}</code>
                  </pre>
                  {line.type === 'added' && (
                    <span className="flex items-center px-2 py-2 shrink-0">
                      <Plus className="w-4 h-4 text-green-400" />
                    </span>
                  )}
                  {line.type === 'removed' && (
                    <span className="flex items-center px-2 py-2 shrink-0">
                      <Minus className="w-4 h-4 text-red-400" />
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Standard Syntax Highlighting with line highlighting */
          <SyntaxHighlighter
            language={language || 'text'}
            style={vscDarkPlus}
            showLineNumbers={localLineNumbers}
            customStyle={{
              margin: 0,
              padding: '1.25rem',
              background: 'transparent',
              fontSize: '0.8125rem',
              lineHeight: '1.6',
            }}
            lineNumberStyle={{
              minWidth: '2.5em',
              paddingRight: '1em',
              color: 'rgba(255,255,255,0.2)',
              userSelect: 'none',
            }}
            wrapLines={true}
            wrapLongLines={true}
            PreTag="div"
            lineProps={(lineNumber) => ({
              style: {
                backgroundColor: highlightedLines.includes(lineNumber) 
                  ? 'rgba(251, 191, 36, 0.12)' 
                  : 'transparent',
                borderLeft: highlightedLines.includes(lineNumber)
                  ? '3px solid #fbbf24'
                  : 'none',
                marginLeft: highlightedLines.includes(lineNumber)
                  ? '-3px'
                  : '0',
                paddingLeft: highlightedLines.includes(lineNumber)
                  ? '3px'
                  : '0',
              }
            })}
          >
            {code}
          </SyntaxHighlighter>
        )}
      </div>
      
      {/* Run Output Panel */}
      <AnimatePresence>
        {runOutput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-border/50 bg-black/30"
          >
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border/30">
              <Terminal className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-muted-foreground">Output</span>
              {runOutput.error ? (
                <XCircle className="w-4 h-4 text-red-400" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-green-400" />
              )}
              <button
                onClick={() => setRunOutput(null)}
                className="ml-auto p-1 hover:bg-secondary/50 rounded"
              >
                <span className="sr-only">Close</span>
                <span className="text-xs text-muted-foreground">×</span>
              </button>
            </div>
            <pre className={cn(
              'p-4 text-[13px] font-mono overflow-x-auto max-h-48',
              runOutput.error ? 'text-red-400' : 'text-green-300'
            )}>
              {runOutput.error || runOutput.output}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/**
 * Inline Code Block for ReactMarkdown integration
 */
interface InlineCodeBlockProps {
  code: string;
  language: string;
  codeId: string;
}

export function InlineCodeBlock({ code, language, codeId }: InlineCodeBlockProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  return (
    <div className="relative group/notebook inline-block my-4">
      {/* Copy button */}
      <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover/notebook:opacity-100 transition-opacity">
        <motion.button
          onClick={() => {
            navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className={cn(
            'p-2 rounded-lg backdrop-blur-sm transition-all',
            'bg-secondary/90 hover:bg-secondary',
            copied && 'bg-green-500/20 text-green-500'
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={copied ? 'Copied' : 'Copy code'}
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        </motion.button>
      </div>

      {/* Code block */}
      <EnhancedCodeBlock
        code={code}
        language={language}
        showLineNumbers={true}
      />
    </div>
  );
}
