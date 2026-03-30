/**
 * Code Syntax Highlighting Theme Hook
 * Manages code block themes with VS Code-like themes, persistence, and system preference detection
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';

// Import all available VS Code-like themes
import vscDarkPlus from 'react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus';
import vs from 'react-syntax-highlighter/dist/esm/styles/prism/vs';
import oneDark from 'react-syntax-highlighter/dist/esm/styles/prism/one-dark';
import nightOwl from 'react-syntax-highlighter/dist/esm/styles/prism/night-owl';
import a11yDark from 'react-syntax-highlighter/dist/esm/styles/prism/a11y-dark';
import a11yOneLight from 'react-syntax-highlighter/dist/esm/styles/prism/a11y-one-light';
import ghcolors from 'react-syntax-highlighter/dist/esm/styles/prism/ghcolors';
import dracula from 'react-syntax-highlighter/dist/esm/styles/prism/dracula';
import nord from 'react-syntax-highlighter/dist/esm/styles/prism/nord';
import materialDark from 'react-syntax-highlighter/dist/esm/styles/prism/material-dark';
import okaidia from 'react-syntax-highlighter/dist/esm/styles/prism/okaidia';
import solarizedlight from 'react-syntax-highlighter/dist/esm/styles/prism/solarizedlight';

export type CodeThemeId = 
  | 'vsc-dark-plus' 
  | 'vs' 
  | 'one-dark' 
  | 'night-owl' 
  | 'a11y-dark' 
  | 'a11y-light'
  | 'ghcolors' 
  | 'dracula' 
  | 'nord'
  | 'material-dark'
  | 'okaidia'
  | 'solarized-light'
  | 'auto';

export interface CodeTheme {
  id: CodeThemeId;
  name: string;
  description: string;
  type: 'dark' | 'light';
  style: object;
  preview: {
    background: string;
    foreground: string;
    keyword: string;
    string: string;
    comment: string;
  };
}

export const CODE_THEMES: CodeTheme[] = [
  {
    id: 'vsc-dark-plus',
    name: 'VS Code Dark+',
    description: 'Classic VS Code dark theme',
    type: 'dark',
    style: vscDarkPlus,
    preview: { background: '#1e1e1e', foreground: '#d4d4d4', keyword: '#569cd6', string: '#ce9178', comment: '#6a9955' },
  },
  {
    id: 'one-dark',
    name: 'One Dark Pro',
    description: 'Atom-inspired dark theme',
    type: 'dark',
    style: oneDark,
    preview: { background: '#282c34', foreground: '#abb2bf', keyword: '#c678dd', string: '#98c379', comment: '#5c6370' },
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Relaxing dark theme for night coding',
    type: 'dark',
    style: nightOwl,
    preview: { background: '#011627', foreground: '#d6deeb', keyword: '#c792ea', string: '#addb67', comment: '#637777' },
  },
  {
    id: 'ghcolors',
    name: 'GitHub Dark',
    description: 'GitHub dark mode colors',
    type: 'dark',
    style: ghcolors,
    preview: { background: '#0d1117', foreground: '#c9d1d9', keyword: '#ff7b72', string: '#a5d6ff', comment: '#8b949e' },
  },
  {
    id: 'dracula',
    name: 'Dracula',
    description: 'Dark theme with vibrant colors',
    type: 'dark',
    style: dracula,
    preview: { background: '#282a36', foreground: '#f8f8f2', keyword: '#ff79c6', string: '#f1fa8c', comment: '#6272a4' },
  },
  {
    id: 'nord',
    name: 'Nord',
    description: 'Arctic, north-bluish color palette',
    type: 'dark',
    style: nord,
    preview: { background: '#2e3440', foreground: '#d8dee9', keyword: '#81a1c1', string: '#a3be8c', comment: '#4c566a' },
  },
  {
    id: 'material-dark',
    name: 'Material Dark',
    description: 'Material Design inspired dark',
    type: 'dark',
    style: materialDark,
    preview: { background: '#263238', foreground: '#eeffff', keyword: '#89ddff', string: '#c3e88d', comment: '#546e7a' },
  },
  {
    id: 'okaidia',
    name: 'Okaidia',
    description: 'Twilight-inspired dark theme',
    type: 'dark',
    style: okaidia,
    preview: { background: '#272822', foreground: '#f8f8f2', keyword: '#f92672', string: '#e6db74', comment: '#75715e' },
  },
  {
    id: 'a11y-dark',
    name: 'A11y Dark',
    description: 'High contrast accessible dark theme',
    type: 'dark',
    style: a11yDark,
    preview: { background: '#1b1b1b', foreground: '#eeeeee', keyword: '#ff8906', string: '#fec32d', comment: '#00e5e5' },
  },
  {
    id: 'vs',
    name: 'VS Code Light',
    description: 'Classic VS Code light theme',
    type: 'light',
    style: vs,
    preview: { background: '#ffffff', foreground: '#000000', keyword: '#0000ff', string: '#a31515', comment: '#008000' },
  },
  {
    id: 'a11y-light',
    name: 'A11y Light',
    description: 'High contrast accessible light theme',
    type: 'light',
    style: a11yOneLight,
    preview: { background: '#fefefe', foreground: '#181818', keyword: '#0033b3', string: '#067d17', comment: '#773088' },
  },
  {
    id: 'solarized-light',
    name: 'Solarized Light',
    description: 'Precise soft contrast light',
    type: 'light',
    style: solarizedlight,
    preview: { background: '#fdf6e3', foreground: '#657b83', keyword: '#859900', string: '#2aa198', comment: '#93a1a1' },
  },
];

// Popular themes for quick access
export const POPULAR_THEMES: CodeThemeId[] = ['vsc-dark-plus', 'vs', 'one-dark', 'ghcolors', 'night-owl', 'dracula'];

interface CodeThemeContextType {
  codeTheme: CodeThemeId;
  setCodeTheme: (theme: CodeThemeId) => void;
  resolvedTheme: CodeTheme;
  themes: CodeTheme[];
  isDark: boolean;
  isAuto: boolean;
}

const CodeThemeContext = createContext<CodeThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'code-syntax-theme';

function getSystemPreference(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(themeId: CodeThemeId): CodeTheme {
  if (themeId === 'auto') {
    const systemPref = getSystemPreference();
    // Default to vsc-dark-plus for dark, vs for light
    const defaultDark = CODE_THEMES.find(t => t.id === 'vsc-dark-plus')!;
    const defaultLight = CODE_THEMES.find(t => t.id === 'vs')!;
    return systemPref === 'dark' ? defaultDark : defaultLight;
  }
  return CODE_THEMES.find(t => t.id === themeId) || CODE_THEMES[0];
}

export function CodeThemeProvider({ children }: { children: ReactNode }) {
  const [codeTheme, setCodeThemeState] = useState<CodeThemeId>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (CODE_THEMES.some(t => t.id === saved) || saved === 'auto')) {
        return saved as CodeThemeId;
      }
    }
    return 'auto';
  });

  const [systemPreference, setSystemPreference] = useState<'dark' | 'light'>(getSystemPreference);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const setCodeTheme = useCallback((theme: CodeThemeId) => {
    setCodeThemeState(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, []);

  const resolvedTheme = useMemo(() => resolveTheme(codeTheme), [codeTheme]);
  const isDark = resolvedTheme.type === 'dark';
  const isAuto = codeTheme === 'auto';

  const value = useMemo(() => ({
    codeTheme,
    setCodeTheme,
    resolvedTheme,
    themes: CODE_THEMES,
    isDark,
    isAuto,
  }), [codeTheme, setCodeTheme, resolvedTheme, isDark, isAuto]);

  return (
    <CodeThemeContext.Provider value={value}>
      {children}
    </CodeThemeContext.Provider>
  );
}

export function useCodeTheme() {
  const context = useContext(CodeThemeContext);
  if (context === undefined) {
    throw new Error('useCodeTheme must be used within a CodeThemeProvider');
  }
  return context;
}

// Convenience hook to just get the current style object
export function useCodeThemeStyle() {
  const { resolvedTheme } = useCodeTheme();
  return resolvedTheme.style;
}
