/**
 * Code Examples Panel - Dedicated code snippets section
 * Supports multiple languages, line highlighting, inline comments, and copy functionality
 */

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SyntaxHighlighter from 'react-syntax-highlighter';

// Define types locally since they're not exported from react-syntax-highlighter
interface LineNumberProps {
  number: number;
  style?: React.CSSProperties;
}

interface RendererNode {
  type: 'element' | 'text';
  value?: string | number;
  tagName?: keyof React.JSX.IntrinsicElements | React.ComponentType<unknown>;
  properties?: { className?: string[]; [key: string]: unknown };
  children?: RendererNode[];
}

interface RendererProps {
  rows: RendererNode[];
  stylesheet: Record<string, React.CSSProperties>;
  useInlineStyles: boolean;
}
import { 
  vscDarkPlus, 
  oneDark, 
  atomDark,
  dracula 
} from 'react-syntax-highlighter/dist/esm/styles/prism';
import { 
  Code2, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronRight,
  Play,
  FileCode,
  Hash,
  Highlighter,
  Terminal,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface CodeComment {
  line: number;
  text: string;
}

export interface CodeHighlight {
  startLine: number;
  endLine: number;
  color?: string;
}

export interface CodeSnippet {
  id: string;
  language: string;
  label?: string;
  code: string;
  description?: string;
  highlights?: CodeHighlight[];
  comments?: CodeComment[];
  filename?: string;
}

export interface CodeExample {
  id: string;
  title: string;
  description?: string;
  snippets: CodeSnippet[];
}

interface CodeExamplesPanelProps {
  examples: CodeExample[];
  showTitle?: boolean;
  defaultExpanded?: boolean;
}

// ============================================
// LANGUAGE CONFIGURATION
// ============================================

const languageConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  javascript: { label: 'JavaScript', icon: <FileCode className="w-3.5 h-3.5" />, color: '#f7df1e' },
  typescript: { label: 'TypeScript', icon: <FileCode className="w-3.5 h-3.5" />, color: '#3178c6' },
  python: { label: 'Python', icon: <FileCode className="w-3.5 h-3.5" />, color: '#3776ab' },
  java: { label: 'Java', icon: <FileCode className="w-3.5 h-3.5" />, color: '#ed8b00' },
  go: { label: 'Go', icon: <FileCode className="w-3.5 h-3.5" />, color: '#00add8' },
  rust: { label: 'Rust', icon: <FileCode className="w-3.5 h-3.5" />, color: '#dea584' },
  cpp: { label: 'C++', icon: <FileCode className="w-3.5 h-3.5" />, color: '#00599c' },
  csharp: { label: 'C#', icon: <FileCode className="w-3.5 h-3.5" />, color: '#239120' },
  ruby: { label: 'Ruby', icon: <FileCode className="w-3.5 h-3.5" />, color: '#cc342d' },
  php: { label: 'PHP', icon: <FileCode className="w-3.5 h-3.5" />, color: '#777bb4' },
  swift: { label: 'Swift', icon: <FileCode className="w-3.5 h-3.5" />, color: '#fa7343' },
  kotlin: { label: 'Kotlin', icon: <FileCode className="w-3.5 h-3.5" />, color: '#7f52ff' },
  sql: { label: 'SQL', icon: <Terminal className="w-3.5 h-3.5" />, color: '#e38c00' },
  bash: { label: 'Bash', icon: <Terminal className="w-3.5 h-3.5" />, color: '#4eaa25' },
  html: { label: 'HTML', icon: <Code2 className="w-3.5 h-3.5" />, color: '#e34f26' },
  css: { label: 'CSS', icon: <Code2 className="w-3.5 h-3.5" />, color: '#1572b6' },
  json: { label: 'JSON', icon: <Layers className="w-3.5 h-3.5" />, color: '#000000' },
  yaml: { label: 'YAML', icon: <FileCode className="w-3.5 h-3.5" />, color: '#cb171e' },
  graphql: { label: 'GraphQL', icon: <FileCode className="w-3.5 h-3.5" />, color: '#e10098' },
  dockerfile: { label: 'Docker', icon: <FileCode className="w-3.5 h-3.5" />, color: '#2496ed' },
};

const getLanguageConfig = (lang: string) => {
  const lowerLang = lang.toLowerCase();
    return languageConfig[lowerLang] || { 
      label: lang, 
      icon: <FileCode className="w-3.5 h-3.5" />, 
      color: 'var(--gh-fg-muted)' 
    };
};

// ============================================
// LINE NUMBER COMPONENT
// ============================================

function LineNumber({ number, style }: LineNumberProps) {
  return (
    <span
      style={{
        ...style,
        display: 'inline-block',
        width: '2.5em',
        textAlign: 'right',
        paddingRight: '1em',
        color: 'rgba(255, 255, 255, 0.3)',
        userSelect: 'none',
      }}
    >
      {number}
    </span>
  );
}

// ============================================
// COMMENT MARKER COMPONENT
// ============================================

function CommentMarker({ comment }: { comment: CodeComment }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute -left-2 top-1/2 -translate-y-1/2 group"
    >
      <div className="relative">
        <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[8px] border-l-amber-500/60 border-b-[6px] border-b-transparent" />
        <div className="absolute left-full top-0 ml-2 px-3 py-2 bg-amber-500/20 border border-amber-500/40 rounded-lg text-amber-200 text-xs max-w-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />
            <span>{comment.text}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================
// HIGHLIGHTED LINE STYLES
// ============================================

const highlightStyles: Record<string, React.CSSProperties> = {
  default: { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderLeft: '3px solid #3b82f6' },
  green: { backgroundColor: 'rgba(34, 197, 94, 0.15)', borderLeft: '3px solid #22c55e' },
  amber: { backgroundColor: 'rgba(245, 158, 11, 0.15)', borderLeft: '3px solid #f59e0b' },
  red: { backgroundColor: 'rgba(239, 68, 68, 0.15)', borderLeft: '3px solid #ef4444' },
  purple: { backgroundColor: 'rgba(168, 85, 247, 0.15)', borderLeft: '3px solid #a855f7' },
  cyan: { backgroundColor: 'rgba(6, 182, 212, 0.15)', borderLeft: '3px solid #06b6d4' },
};

// ============================================
// INDIVIDUAL CODE SNIPPET COMPONENT
// ============================================

function CodeSnippetView({ 
  snippet, 
  isActive 
}: { 
  snippet: CodeSnippet;
  isActive: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [showAllLines, setShowAllLines] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Process code for line highlighting and comments
  const codeLines = snippet.code.split('\n');
  const displayLines = showAllLines ? codeLines : codeLines.slice(0, 30);
  const hasMoreLines = codeLines.length > 30;

  // Check which lines should be highlighted
  const isHighlighted = useCallback((lineIndex: number) => {
    if (!snippet.highlights) return false;
    const lineNum = lineIndex + 1;
    return snippet.highlights.some(h => 
      lineNum >= h.startLine && lineNum <= h.endLine
    );
  }, [snippet.highlights]);

  // Get highlight color for a line
  const getHighlightColor = useCallback((lineIndex: number): string => {
    if (!snippet.highlights) return 'default';
    const lineNum = lineIndex + 1;
    const highlight = snippet.highlights?.find(h => 
      lineNum >= h.startLine && lineNum <= h.endLine
    );
    return highlight?.color || 'default';
  }, [snippet.highlights]);

  // Check for comments on a line
  const getCommentForLine = useCallback((lineIndex: number): CodeComment | undefined => {
    return snippet.comments?.find(c => c.line === lineIndex + 1);
  }, [snippet.comments]);

  // Custom renderer for syntax highlighter
  const customStyle: React.CSSProperties = {
    margin: 0,
    padding: '1rem',
    background: 'transparent',
    fontSize: '0.8125rem',
    lineHeight: '1.7',
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  };

  const langConfig = getLanguageConfig(snippet.language);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="relative"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
            <div className="flex items-center gap-3">
              {snippet.filename && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                  <FileCode className="w-3.5 h-3.5" />
                  {snippet.filename}
                </span>
              )}
              {snippet.description && (
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  {snippet.description}
                </span>
              )}
            </div>
            <motion.button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-green-500 font-medium">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Code Block */}
          <div className="relative overflow-x-auto">
            <SyntaxHighlighter
              language={snippet.language}
              style={vscDarkPlus}
              customStyle={customStyle}
              showLineNumbers={true}
              lineNumberRenderer={LineNumber}
              wrapLines={true}
              wrapLongLines={true}
              renderer={({ rows }) => {
                return (
                  <>
                    {rows.map((row, index) => {
                      const highlighted = isHighlighted(index);
                      const highlightColor = getHighlightColor(index);
                      const comment = getCommentForLine(index);
                      
                      return (
                        <div
                          key={index}
                          className={`relative transition-colors ${
                            highlighted ? 'block' : 'block'
                          }`}
                          style={highlighted ? highlightStyles[highlightColor] : {}}
                        >
                          {comment && <CommentMarker comment={comment} />}
                          {typeof row.value === 'string' ? row.value : String(row.value ?? '')}
                        </div>
                      );
                    })}
                    {hasMoreLines && !showAllLines && (
                      <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setShowAllLines(true)}
                        className="w-full py-3 text-center text-sm text-muted-foreground hover:text-primary bg-muted/30 hover:bg-muted/50 transition-all border-t border-border flex items-center justify-center gap-2"
                      >
                        <ChevronDown className="w-4 h-4" />
                        Show {codeLines.length - 30} more lines
                      </motion.button>
                    )}
                  </>
                );
              }}
            >
              {snippet.code}
            </SyntaxHighlighter>
          </div>

          {/* Footer with legend */}
          {(snippet.highlights?.length || snippet.comments?.length) && (
            <div className="px-4 py-2 bg-muted/30 border-t border-border flex flex-wrap items-center gap-3 text-xs">
              {snippet.highlights && snippet.highlights.length > 0 && (
                <div className="flex items-center gap-2">
                  <Highlighter className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">Highlights:</span>
                  {snippet.highlights.map((h, i) => {
                    const borderLeftValue = highlightStyles[h.color || 'default'].borderLeft;
                    const bgColor = typeof borderLeftValue === 'string' 
                      ? borderLeftValue.replace('3px solid ', '') 
                      : '#3b82f6';
                    return (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-white"
                        style={{ backgroundColor: bgColor }}
                      >
                        Lines {h.startLine}-{h.endLine}
                      </span>
                    );
                  })}
                </div>
              )}
              {snippet.comments && snippet.comments.length > 0 && (
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-amber-500">{snippet.comments.length} inline comment{snippet.comments.length > 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================
// SINGLE CODE EXAMPLE (with language tabs)
// ============================================

function CodeExampleSection({ 
  example, 
  defaultExpanded = true 
}: { 
  example: CodeExample;
  defaultExpanded?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [activeSnippet, setActiveSnippet] = useState(example.snippets[0]?.id || '');

  const uniqueLanguages = Array.from(new Set(example.snippets.map(s => s.language)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card overflow-hidden"
    >
      {/* Example Header */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
        whileHover={{ backgroundColor: 'hsl(var(--muted) / 0.3)' }}
      >
        <div className="flex items-center gap-3">
          <Code2 className="w-5 h-5 text-primary" />
          <span className="font-bold text-foreground">{example.title}</span>
          {example.description && (
            <span className="text-sm text-muted-foreground hidden sm:inline">
              — {example.description}
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Language badges */}
          <div className="hidden md:flex items-center gap-1.5">
            {uniqueLanguages.slice(0, 3).map(lang => {
              const config = getLanguageConfig(lang);
              return (
                <span
                  key={lang}
                  className="px-2 py-0.5 text-xs font-mono rounded-md"
                  style={{ 
                    backgroundColor: `${config.color}20`,
                    color: config.color,
                    border: `1px solid ${config.color}40`
                  }}
                >
                  {config.label}
                </span>
              );
            })}
            {uniqueLanguages.length > 3 && (
              <span className="px-2 py-0.5 text-xs text-muted-foreground">
                +{uniqueLanguages.length - 3}
              </span>
            )}
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 0 : -90 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          </motion.div>
        </div>
      </motion.button>

      {/* Language Tabs */}
      {example.snippets.length > 1 && (
        <div className="flex items-center gap-1 px-2 py-2 bg-muted/30 border-b border-border overflow-x-auto">
          {example.snippets.map((snippet, index) => {
            const config = getLanguageConfig(snippet.language);
            const isActive = activeSnippet === snippet.id;
            
            return (
              <motion.button
                key={snippet.id}
                onClick={() => setActiveSnippet(snippet.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {config.icon}
                <span>{snippet.label || config.label}</span>
                {index === 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-green-500/20 text-green-400 rounded">
                    Main
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Snippet Content */}
      <AnimatePresence mode="wait">
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            {example.snippets.map((snippet) => (
              <CodeSnippetView
                key={snippet.id}
                snippet={snippet}
                isActive={example.snippets.length === 1 || activeSnippet === snippet.id}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function CodeExamplesPanel({ 
  examples, 
  showTitle = true,
  defaultExpanded = true
}: CodeExamplesPanelProps) {
  if (!examples || examples.length === 0) return null;

  const totalSnippets = examples.reduce((acc, ex) => acc + ex.snippets.length, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Section Header */}
      {showTitle && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
              <Code2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Code Examples</h3>
              <p className="text-sm text-muted-foreground">
                {examples.length} example{totalSnippets > 1 ? 's' : ''} • {totalSnippets} snippet{totalSnippets > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Examples List */}
      <div className="space-y-4">
        {examples.map((example, index) => (
          <motion.div
            key={example.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <CodeExampleSection 
              example={example} 
              defaultExpanded={defaultExpanded && index === 0}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ============================================
// HELPER FUNCTION - Create code examples from answer text
// ============================================

/**
 * Parse markdown code blocks from answer text to extract code examples
 * This is a utility to help create CodeExample objects from existing data
 */
export function parseCodeExamplesFromMarkdown(markdown: string): CodeExample[] {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const examples: CodeExample[] = [];
  let match;
  let snippetIndex = 0;

  while ((match = codeBlockRegex.exec(markdown)) !== null) {
    const language = match[1] || 'text';
    const code = match[2].trim();
    
    // Skip if code is too short
    if (code.length < 10) continue;

    // Create a snippet
    const snippet: CodeSnippet = {
      id: `snippet-${snippetIndex++}`,
      language,
      code,
    };

    // Add to existing example or create new one
    const existingExample = examples[examples.length - 1];
    if (existingExample && existingExample.title === 'Code Examples') {
      existingExample.snippets.push(snippet);
    } else {
      examples.push({
        id: `example-${examples.length}`,
        title: 'Code Examples',
        snippets: [snippet],
      });
    }
  }

  return examples;
}

export default CodeExamplesPanel;
