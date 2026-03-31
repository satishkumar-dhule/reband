/**
 * Themeable Code Block Component
 * Syntax highlighted code block with theme switching, copy button, and language label
 */

import { useState, useCallback } from 'react';
import { Prism as SyntaxHighlighter, type SyntaxHighlighterProps } from 'react-syntax-highlighter';
import { useCodeTheme } from '../hooks/useCodeTheme';
import { InlineCodeThemeSelector } from './CodeThemeSelector';
import { Code2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/unified/Button';

// Language display names
const LANGUAGE_NAMES: Record<string, string> = {
  js: 'JavaScript',
  javascript: 'JavaScript',
  ts: 'TypeScript',
  typescript: 'TypeScript',
  tsx: 'TypeScript React',
  jsx: 'JavaScript React',
  py: 'Python',
  python: 'Python',
  java: 'Java',
  go: 'Go',
  golang: 'Go',
  rs: 'Rust',
  rust: 'Rust',
  rb: 'Ruby',
  ruby: 'Ruby',
  php: 'PHP',
  swift: 'Swift',
  kotlin: 'Kotlin',
  c: 'C',
  cpp: 'C++',
  cs: 'C#',
  csharp: 'C#',
  'c++': 'C++',
  sql: 'SQL',
  bash: 'Bash',
  shell: 'Shell',
  sh: 'Shell',
  powershell: 'PowerShell',
  yaml: 'YAML',
  yml: 'YAML',
  json: 'JSON',
  xml: 'XML',
  html: 'HTML',
  css: 'CSS',
  scss: 'SCSS',
  less: 'Less',
  dockerfile: 'Dockerfile',
  docker: 'Dockerfile',
  markdown: 'Markdown',
  md: 'Markdown',
  graphql: 'GraphQL',
  gql: 'GraphQL',
  terraform: 'Terraform',
  tf: 'Terraform',
  hcl: 'HCL',
  lua: 'Lua',
  perl: 'Perl',
  r: 'R',
  scala: 'Scala',
  dart: 'Dart',
  elixir: 'Elixir',
  erlang: 'Erlang',
  haskell: 'Haskell',
  ocaml: 'OCaml',
  text: 'Plain Text',
  plain: 'Plain Text',
};

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  showThemeSelector?: boolean;
  className?: string;
  style?: React.CSSProperties;
  customStyle?: SyntaxHighlighterProps['customStyle'];
  wrapLines?: boolean;
  wrapLongLines?: boolean;
}

export function CodeBlock({
  code,
  language = 'text',
  showLineNumbers = false,
  showThemeSelector = false,
  className,
  style,
  customStyle,
  wrapLines = true,
  wrapLongLines = true,
}: CodeBlockProps) {
  const { resolvedTheme, isDark } = useCodeTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const displayLanguage = LANGUAGE_NAMES[language.toLowerCase()] || language.toUpperCase();

  // Determine if we need a light background for the header
  const isLightTheme = !isDark;
  const headerBg = isLightTheme ? 'bg-muted/80' : 'bg-[var(--gh-canvas-subtle,#1e1e1e)]/80';

  return (
    <div 
      className={`rounded-lg sm:rounded-xl overflow-hidden border border-border/50 ${className || ''}`}
      style={style}
    >
      {/* Header */}
      <div className={`flex items-center justify-between px-3 sm:px-4 py-1.5 sm:py-2 ${headerBg} border-b border-border/50 backdrop-blur-sm`}>
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground" />
          <span className="text-[10px] sm:text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            {displayLanguage}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {showThemeSelector && <InlineCodeThemeSelector />}

          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            aria-label={copied ? 'Copied!' : 'Copy code'}
            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs"
          >
            {copied ? (
              <>
                <Check aria-hidden="true" className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-500" />
                <span className="text-emerald-500 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy aria-hidden="true" className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Copy</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Code */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language || 'text'}
          style={resolvedTheme.style as SyntaxHighlighterProps['style']}
          customStyle={{
            margin: 0,
            padding: '0.875rem',
            background: 'transparent',
            fontSize: '0.8125rem',
            lineHeight: '1.6',
            fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, Monaco, 'Courier New', monospace",
          }}
          showLineNumbers={showLineNumbers}
          lineNumberStyle={{
            minWidth: '2.5em',
            paddingRight: '1em',
            color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
            userSelect: 'none',
          }}
          wrapLines={wrapLines}
          wrapLongLines={wrapLongLines}
          codeTagProps={{
            style: {
              fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, Monaco, 'Courier New', monospace",
            }
          }}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

// Simpler version for inline use
interface InlineCodeBlockProps {
  code: string;
  language?: string;
  maxHeight?: string;
}

export function InlineCodeBlock({ code, language = 'text', maxHeight = '400px' }: InlineCodeBlockProps) {
  const { resolvedTheme, isDark } = useCodeTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [code]);

  const displayLanguage = LANGUAGE_NAMES[language.toLowerCase()] || language.toUpperCase();

  return (
    <div className="rounded-lg overflow-hidden border border-border/50">
      <div className="flex items-center justify-between px-3 py-1.5 bg-muted/50 border-b border-border/50">
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
          {displayLanguage}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="flex items-center gap-1 px-1.5 py-0.5 text-[10px]"
        >
          {copied ? (
            <Check className="w-3 h-3 text-emerald-500" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </Button>
      </div>
      <div className="overflow-auto" style={{ maxHeight }}>
        <SyntaxHighlighter
          language={language || 'text'}
          style={resolvedTheme.style as SyntaxHighlighterProps['style']}
          customStyle={{
            margin: 0,
            padding: '0.75rem',
            background: 'transparent',
            fontSize: '0.75rem',
            lineHeight: '1.5',
          }}
          wrapLines={true}
          wrapLongLines={true}
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

// Minimal version - just code with copy button
interface MinimalCodeBlockProps {
  code: string;
  language?: string;
}

export function MinimalCodeBlock({ code, language = 'text' }: MinimalCodeBlockProps) {
  const { resolvedTheme } = useCodeTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [code]);

  return (
    <div className="relative group rounded-md overflow-hidden border border-border/30">
      <SyntaxHighlighter
        language={language || 'text'}
        style={resolvedTheme.style as SyntaxHighlighterProps['style']}
        customStyle={{
          margin: 0,
          padding: '0.75rem',
          background: 'transparent',
          fontSize: '0.8125rem',
          lineHeight: '1.5',
        }}
        wrapLines={true}
        wrapLongLines={true}
      >
        {code}
      </SyntaxHighlighter>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleCopy}
        className="absolute top-2 right-2 p-1.5 rounded-md bg-background/80 backdrop-blur-sm border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
        aria-label="Copy code"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-emerald-500" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </Button>
    </div>
  );
}
