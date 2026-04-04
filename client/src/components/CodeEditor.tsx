/**
 * Code Editor using CodeMirror 6 — lightweight, instant-load, works in any layout.
 * Replaces Monaco Editor which had sizing issues in flex containers.
 */
import { useCallback, useRef, useEffect } from 'react';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { vscodeDark, vscodeLight } from '@uiw/codemirror-theme-vscode';
import { EditorView } from '@codemirror/view';
import { Copy, Check, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: 'javascript' | 'python';
  onLanguageChange?: (lang: 'javascript' | 'python') => void;
  placeholder?: string;
  readOnly?: boolean;
  height?: string;
  showToolbar?: boolean;
  initialCode?: string;
}

function makeBaseTheme(isDark: boolean) {
  return EditorView.theme({
    '&': {
      height: '100%',
      fontSize: '14px',
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Menlo, Monaco, 'Courier New', monospace",
    },
    '.cm-scroller': {
      overflow: 'auto',
      fontFamily: 'inherit',
      lineHeight: '1.6',
    },
    '.cm-content': {
      padding: '12px 0',
    },
    '.cm-line': {
      padding: '0 16px',
    },
    '.cm-gutters': {
      borderRight: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)',
      paddingRight: '4px',
      minWidth: '48px',
    },
    '.cm-activeLineGutter': {
      backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
    },
    '.cm-activeLine': {
      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
    },
    '.cm-tooltip': {
      border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.15)',
      borderRadius: '6px',
    },
  });
}

export function CodeEditor({
  value,
  onChange,
  language,
  onLanguageChange,
  readOnly = false,
  height = '300px',
  showToolbar = true,
  initialCode = '',
}: CodeEditorProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const editorRef = useRef<ReactCodeMirrorRef>(null);
  const [copied, setCopied] = useState(false);

  const extensions = [
    language === 'javascript' ? javascript({ jsx: true, typescript: false }) : python(),
    makeBaseTheme(isDark),
    EditorView.lineWrapping,
  ];

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [value]);

  const handleReset = useCallback(() => {
    onChange(initialCode);
  }, [onChange, initialCode]);

  return (
    <div className="absolute inset-0 flex flex-col overflow-hidden" data-testid="monaco-editor">
      {showToolbar && !readOnly && (
        <div className="flex items-center justify-between px-3 py-2 bg-[var(--gh-canvas-subtle)] border-b border-[var(--gh-border)] shrink-0">
          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => onLanguageChange?.(e.target.value as 'javascript' | 'python')}
              className="px-2 py-1 text-sm bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded text-[var(--gh-fg)] focus:outline-none"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
            </select>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={handleCopy} className="p-1.5 rounded hover:bg-[var(--gh-canvas)] text-[var(--gh-fg-muted)] transition-colors" title="Copy">
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <button onClick={handleReset} className="p-1.5 rounded hover:bg-[var(--gh-canvas)] text-[var(--gh-fg-muted)] transition-colors" title="Reset" disabled={value === initialCode}>
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        <CodeMirror
          ref={editorRef}
          value={value}
          height="100%"
          extensions={extensions}
          theme={isDark ? vscodeDark : vscodeLight}
          onChange={onChange}
          readOnly={readOnly}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLineGutter: true,
            highlightSpecialChars: true,
            foldGutter: true,
            dropCursor: true,
            allowMultipleSelections: true,
            indentOnInput: true,
            syntaxHighlighting: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            rectangularSelection: true,
            crosshairCursor: false,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
            closeBracketsKeymap: true,
            defaultKeymap: true,
            searchKeymap: true,
            historyKeymap: true,
            foldKeymap: true,
            completionKeymap: true,
            lintKeymap: true,
          }}
          style={{ height: '100%', fontSize: '14px' }}
        />
      </div>
    </div>
  );
}

// Read-only code display (lightweight, no toolbar)
export function CodeDisplay({
  code,
  language,
  height = '200px',
}: {
  code: string;
  language: 'javascript' | 'python';
  height?: string;
}) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [copied, setCopied] = useState(false);

  const extensions = [
    language === 'javascript' ? javascript() : python(),
    EditorView.theme({
      '&': { fontSize: '13px', fontFamily: "'JetBrains Mono', monospace" },
      '.cm-content': { padding: '8px 0' },
      '.cm-line': { padding: '0 12px' },
      '.cm-scroller': { fontFamily: 'inherit' },
    }),
  ];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg overflow-hidden border border-[var(--gh-border)]">
      <div className="flex items-center justify-between px-3 py-1.5 bg-[var(--gh-canvas-subtle)] border-b border-[var(--gh-border)]">
        <span className="text-xs text-[var(--gh-fg-muted)] capitalize">{language}</span>
        <button onClick={handleCopy} className="p-1 hover:bg-[var(--gh-canvas)] rounded transition-colors">
          {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-[var(--gh-fg-muted)]" />}
        </button>
      </div>
      <CodeMirror
        value={code}
        height={height}
        extensions={extensions}
        theme={isDark ? vscodeDark : vscodeLight}
        readOnly
        basicSetup={{ lineNumbers: true, highlightActiveLine: false, foldGutter: false }}
      />
    </div>
  );
}
