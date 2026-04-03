/**
 * Code Editor Component using Monaco Editor (VS Code's editor)
 * Provides professional syntax highlighting, auto-completion, and code editing
 * 
 * PERFORMANCE: Monaco is fully dynamically imported — zero static imports.
 * The editor chunk is only loaded when this component mounts.
 */

import { useRef, useCallback, useState, useEffect, type ComponentType } from 'react';
import { useTheme } from '../context/ThemeContext';

// Monaco editor types (imported for types only, not runtime)
type OnMount = (editor: any, monaco: any) => void;
type OnChange = (value: string | undefined, event: any) => void;

// Light themes list for theme detection
const lightThemes: string[] = [];

// Monaco editor state — loaded dynamically on first use
let MonacoEditor: ComponentType<any> | null = null;
let monacoLoaderPromise: Promise<void> | null = null;

/**
 * Dynamically load Monaco Editor and define custom theme.
 * Called once on first component mount; cached for subsequent uses.
 */
async function loadMonacoEditor(): Promise<ComponentType<any>> {
  if (MonacoEditor) return MonacoEditor;
  
  if (!monacoLoaderPromise) {
    monacoLoaderPromise = (async () => {
      const editorModule = await import('@monaco-editor/react');
      MonacoEditor = () => null; // placeholder, we use the module directly
      
      const monacoInstance = await editorModule.loader.init();
      
      // Define custom VS Code Dark+ theme
      monacoInstance.editor.defineTheme('vscode-dark-plus', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
          { token: 'keyword', foreground: '569CD6' },
          { token: 'string', foreground: 'CE9178' },
          { token: 'number', foreground: 'B5CEA8' },
          { token: 'regexp', foreground: 'D16969' },
          { token: 'type', foreground: '4EC9B0' },
          { token: 'class', foreground: '4EC9B0' },
          { token: 'function', foreground: 'DCDCAA' },
          { token: 'variable', foreground: '9CDCFE' },
          { token: 'variable.predefined', foreground: '4FC1FF' },
          { token: 'constant', foreground: '4FC1FF' },
          { token: 'parameter', foreground: '9CDCFE' },
          { token: 'operator', foreground: 'D4D4D4' },
          { token: 'delimiter', foreground: 'D4D4D4' },
          { token: 'tag', foreground: '569CD6' },
          { token: 'attribute.name', foreground: '9CDCFE' },
          { token: 'attribute.value', foreground: 'CE9178' },
        ],
        colors: {
          'editor.background': '#0F0F0F',
          'editor.foreground': '#E0E0E0',
          'editor.lineHighlightBackground': '#1A1A1A',
          'editor.selectionBackground': '#264F78',
          'editor.inactiveSelectionBackground': '#3A3D41',
          'editorLineNumber.foreground': '#6E7681',
          'editorLineNumber.activeForeground': '#FFFFFF',
          'editorCursor.foreground': '#00FF88',
          'editor.selectionHighlightBackground': '#ADD6FF26',
          'editorIndentGuide.background': '#2A2A2A',
          'editorIndentGuide.activeBackground': '#00FF88',
          'editorBracketMatch.background': '#0064001A',
          'editorBracketMatch.border': '#00FF88',
        },
      });
      
      MonacoEditor = editorModule.default;
    })();
  }
  
  await monacoLoaderPromise;
  return MonacoEditor!;
}

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: 'javascript' | 'python';
  placeholder?: string;
  readOnly?: boolean;
  height?: string;
}

const defaultEditorOptions = {
  readOnly: false,
  minimap: { enabled: true, scale: 1, showSlider: 'mouseover' as const },
  fontSize: 14,
  fontFamily: "'Fira Code', 'JetBrains Mono', 'SF Mono', Menlo, Monaco, 'Courier New', monospace",
  fontLigatures: true,
  lineNumbers: 'on' as const,
  lineNumbersMinChars: 4,
  glyphMargin: true,
  folding: true,
  foldingHighlight: true,
  foldingStrategy: 'indentation' as const,
  showFoldingControls: 'mouseover' as const,
  lineDecorationsWidth: 10,
  lineHeight: 22,
  letterSpacing: 0.5,
  padding: { top: 16, bottom: 16 },
  scrollBeyondLastLine: true,
  automaticLayout: true,
  tabSize: 2,
  insertSpaces: true,
  wordWrap: 'on' as const,
  wrappingIndent: 'indent' as const,
  cursorBlinking: 'smooth' as const,
  cursorSmoothCaretAnimation: 'on' as const,
  cursorStyle: 'line' as const,
  cursorWidth: 2,
  smoothScrolling: true,
  mouseWheelZoom: true,
  contextmenu: true,
  quickSuggestions: {
    other: true,
    comments: false,
    strings: true,
  },
  suggestOnTriggerCharacters: true,
  acceptSuggestionOnEnter: 'on' as const,
  tabCompletion: 'on' as const,
  wordBasedSuggestions: 'currentDocument' as const,
  parameterHints: { enabled: true },
  autoClosingBrackets: 'always' as const,
  autoClosingQuotes: 'always' as const,
  autoClosingDelete: 'always' as const,
  autoSurround: 'languageDefined' as const,
  autoIndent: 'full' as const,
  formatOnPaste: true,
  formatOnType: true,
  renderWhitespace: 'selection' as const,
  renderLineHighlight: 'all' as const,
  renderLineHighlightOnlyWhenFocus: false,
  bracketPairColorization: { enabled: true, independentColorPoolPerBracketType: true },
  guides: {
    bracketPairs: true,
    bracketPairsHorizontal: true,
    highlightActiveBracketPair: true,
    indentation: true,
    highlightActiveIndentation: true,
  },
  matchBrackets: 'always' as const,
  scrollbar: {
    vertical: 'visible' as const,
    horizontal: 'auto' as const,
    verticalScrollbarSize: 14,
    horizontalScrollbarSize: 14,
    useShadows: true,
    verticalHasArrows: false,
    horizontalHasArrows: false,
  },
  overviewRulerLanes: 3,
  overviewRulerBorder: true,
  hideCursorInOverviewRuler: false,
  stickyScroll: { enabled: false },
  find: {
    addExtraSpaceOnTop: true,
    autoFindInSelection: 'multiline' as const,
    seedSearchStringFromSelection: 'selection' as const,
  },
  suggest: {
    showMethods: true,
    showFunctions: true,
    showConstructors: true,
    showFields: true,
    showVariables: true,
    showClasses: true,
    showStructs: true,
    showInterfaces: true,
    showModules: true,
    showProperties: true,
    showEvents: true,
    showOperators: true,
    showUnits: true,
    showValues: true,
    showConstants: true,
    showEnums: true,
    showEnumMembers: true,
    showKeywords: true,
    showWords: true,
    showColors: true,
    showFiles: true,
    showReferences: true,
    showFolders: true,
    showTypeParameters: true,
    showSnippets: true,
  },
};

const readOnlyEditorOptions = {
  readOnly: true,
  minimap: { enabled: false },
  fontSize: 13,
  fontFamily: "'JetBrains Mono', 'Fira Code', 'SF Mono', Menlo, Monaco, 'Courier New', monospace",
  lineNumbers: 'on' as const,
  lineNumbersMinChars: 3,
  glyphMargin: false,
  folding: false,
  lineDecorationsWidth: 8,
  lineHeight: 20,
  padding: { top: 8, bottom: 8 },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  wordWrap: 'on' as const,
  domReadOnly: true,
  renderLineHighlight: 'none' as const,
  scrollbar: {
    vertical: 'hidden' as const,
    horizontal: 'auto' as const,
  },
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true,
  overviewRulerBorder: false,
};

const editorLoadingFallback = (
  <div className="flex items-center justify-center h-full bg-muted dark:bg-[var(--gh-canvas-inset,#0F0F0F)]">
    <div className="flex flex-col items-center gap-3">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      <span className="text-sm text-muted-foreground font-mono">Loading code editor...</span>
    </div>
  </div>
);

const editorEmptyPlaceholder = (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
    <span className="text-muted-foreground/50 font-mono text-sm">Start typing your code here...</span>
  </div>
);

export function CodeEditor({
  value,
  onChange,
  language,
  readOnly = false,
  height = '300px',
}: CodeEditorProps) {
  const { theme } = useTheme();
  const editorRef = useRef<unknown>(null);
  const isDark = !lightThemes.includes(theme);
  const [EditorComponent, setEditorComponent] = useState<ComponentType<any> | null>(null);
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadMonacoEditor().then((Editor) => {
      if (!cancelled) {
        setEditorComponent(() => Editor);
        setThemeReady(true);
      }
    });
    return () => { cancelled = true; };
  }, []);

  const handleEditorDidMount: OnMount = useCallback((editor) => {
    editorRef.current = editor;
    editor.focus();
  }, []);

  const handleChange: OnChange = useCallback(
    (newValue) => {
      onChange(newValue || '');
    },
    [onChange]
  );

  if (!EditorComponent) {
    return <div className="overflow-hidden h-full">{editorLoadingFallback}</div>;
  }

  return (
    <div className="overflow-hidden h-full" data-testid="monaco-editor">
      <EditorComponent
        height={height}
        language={language}
        value={value}
        onChange={handleChange}
        onMount={handleEditorDidMount}
        theme={isDark && themeReady ? 'vscode-dark-plus' : 'light'}
        options={{ ...defaultEditorOptions, readOnly }}
        loading={editorLoadingFallback}
      />
    </div>
  );
}

// Read-only code display component using Monaco
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
  const isDark = !lightThemes.includes(theme);
  const [EditorComponent, setEditorComponent] = useState<ComponentType<any> | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadMonacoEditor().then((Editor) => {
      if (!cancelled) {
        setEditorComponent(() => Editor);
      }
    });
    return () => { cancelled = true; };
  }, []);

  if (!EditorComponent) {
    return <div className="rounded-lg overflow-hidden border border-border min-h-[200px]">{editorLoadingFallback}</div>;
  }

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      <EditorComponent
        height={height}
        language={language}
        value={code}
        theme={isDark ? 'vs-dark' : 'light'}
        options={readOnlyEditorOptions}
        loading={editorLoadingFallback}
      />
    </div>
  );
}
