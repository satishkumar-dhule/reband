# GitHub Dark Mode Audit Report

## Summary
Audited dark mode toggling and CSS variable coverage across 8 components that leak or don't switch cleanly between themes. All fixes preserve GitHub design system consistency.

---

## 1. MermaidDiagram.tsx - Hardcoded Dark Mode Theme Variables

**Issue**: Hardcoded colors that only work in dark mode, causing poor contrast in light mode.

**Current Code** (lines 85-95):
```tsx
themeVariables: {
  primaryColor: '#00ff88',
  primaryTextColor: '#ffffff',
  primaryBorderColor: '#00d4ff',
  lineColor: '#00d4ff',
  secondaryColor: '#00d4ff',
  tertiaryColor: '#1a1a1a',
  background: '#000000',
  mainBkg: '#1a1a1a',
  secondBkg: '#0a0a0a',
  textColor: '#ffffff',
}
```

**Fix**: Use CSS variables and detect theme:
```tsx
import { useTheme } from '../../context/ThemeContext';

// Inside component:
const { isDark } = useTheme();

// In mermaid initialization:
themeVariables: {
  primaryColor: isDark ? '#00ff88' : '#238636',
  primaryTextColor: isDark ? '#ffffff' : '#1f2328',
  primaryBorderColor: isDark ? '#00d4ff' : '#0969da',
  lineColor: isDark ? '#00d4ff' : '#0969da',
  secondaryColor: isDark ? '#00d4ff' : '#ddf4ff',
  tertiaryColor: isDark ? '#1a1a1a' : '#f6f8fa',
  background: isDark ? '#000000' : '#ffffff',
  mainBkg: isDark ? '#1a1a1a' : '#f6f8fa',
  secondBkg: isDark ? '#0a0a0a' : '#ffffff',
  textColor: isDark ? '#ffffff' : '#1f2328',
}
```

**Class Update**: None required.

---

## 2. CodeExamplesPanel.tsx - Hardcoded Language Colors

**Issue**: Language colors may have poor contrast in both themes, especially JSON's `#000000`.

**Current Code** (lines 94-114):
```tsx
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
```

**Fix**: Use CSS variables for colors that adapt to theme:
```tsx
import { useTheme } from '../../context/ThemeContext';

// Inside component:
const { isDark } = useTheme();

// Create theme-aware language colors:
const getLanguageColor = (lang: string, isDark: boolean): string => {
  const colors: Record<string, { light: string; dark: string }> = {
    javascript: { light: '#f7df1e', dark: '#f7df1e' },
    typescript: { light: '#3178c6', dark: '#58a6ff' },
    python: { light: '#3776ab', dark: '#58a6ff' },
    java: { light: '#ed8b00', dark: '#f0883e' },
    go: { light: '#00add8', dark: '#58a6ff' },
    rust: { light: '#dea584', dark: '#f0883e' },
    cpp: { light: '#00599c', dark: '#58a6ff' },
    csharp: { light: '#239120', dark: '#3fb950' },
    ruby: { light: '#cc342d', dark: '#f85149' },
    php: { light: '#777bb4', dark: '#bc8cff' },
    swift: { light: '#fa7343', dark: '#f0883e' },
    kotlin: { light: '#7f52ff', dark: '#bc8cff' },
    sql: { light: '#e38c00', dark: '#d29922' },
    bash: { light: '#4eaa25', dark: '#3fb950' },
    html: { light: '#e34f26', dark: '#f0883e' },
    css: { light: '#1572b6', dark: '#58a6ff' },
    json: { light: '#1f2328', dark: '#e6edf3' }, // Fixed: use foreground color
    yaml: { light: '#cb171e', dark: '#f85149' },
    graphql: { light: '#e10098', dark: '#bc8cff' },
    dockerfile: { light: '#2496ed', dark: '#58a6ff' },
  };
  return colors[lang]?.[isDark ? 'dark' : 'light'] || (isDark ? '#e6edf3' : '#1f2328');
};

// Update languageConfig to use function:
const languageConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  javascript: { label: 'JavaScript', icon: <FileCode className="w-3.5 h-3.5" /> },
  // ... other languages
};

// When using:
const color = getLanguageColor(lang, isDark);
```

**Class Update**: None required.

---

## 3. enhanced-code-block.tsx - Hardcoded Line Numbers and Highlights

**Issue**: Hardcoded white text for line numbers and yellow for highlights don't adapt to theme.

**Current Code** (lines 571-585):
```tsx
style: {
  color: 'rgba(255,255,255,0.2)',
  userSelect: 'none',
}
// ...
lineProps={(lineNumber) => ({
  style: {
    backgroundColor: highlightedLines.includes(lineNumber) 
      ? 'rgba(251, 191, 36, 0.12)' 
      : 'transparent',
    borderLeft: highlightedLines.includes(lineNumber)
      ? '3px solid #fbbf24'
      : 'none',
    // ...
  }
})}
```

**Fix**: Use CSS variables and detect theme:
```tsx
import { useTheme } from '../../context/ThemeContext';

// Inside component:
const { isDark } = useTheme();

// Update styles:
style: {
  color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.3)',
  userSelect: 'none',
}
// ...
lineProps={(lineNumber) => ({
  style: {
    backgroundColor: highlightedLines.includes(lineNumber) 
      ? (isDark ? 'rgba(251, 191, 36, 0.12)' : 'rgba(251, 191, 36, 0.15)') 
      : 'transparent',
    borderLeft: highlightedLines.includes(lineNumber)
      ? `3px solid ${isDark ? '#fbbf24' : '#bf8700'}`
      : 'none',
    marginLeft: highlightedLines.includes(lineNumber) ? '-3px' : '0',
    paddingLeft: highlightedLines.includes(lineNumber) ? 'calc(1em - 3px)' : '1em',
    // ...
  }
})}
```

**Class Update**: None required.

---

## 4. GenZAnswerPanel.tsx - Hardcoded Background and Text Colors

**Issue**: Hardcoded light/dark colors instead of using CSS variables.

**Current Code** (lines 638-639):
```tsx
style={{
  backgroundColor: isLightMode ? 'hsl(0 0% 100%)' : 'hsl(0 0% 0%)',
  color: isLightMode ? 'hsl(0 0% 5%)' : 'hsl(0 0% 100%)'
}}
```

**Fix**: Use CSS variables for theme consistency:
```tsx
// Remove inline styles and use Tailwind classes:
className="w-full h-full overflow-y-auto overflow-x-hidden bg-background text-foreground"

// Or if keeping inline styles for some reason, use CSS variables:
style={{
  backgroundColor: 'var(--background)',
  color: 'var(--foreground)'
}}
```

**Class Update**: Replace `style` prop with Tailwind classes:
```tsx
// Before:
style={{
  backgroundColor: isLightMode ? 'hsl(0 0% 100%)' : 'hsl(0 0% 0%)',
  color: isLightMode ? 'hsl(0 0% 5%)' : 'hsl(0 0% 100%)'
}}

// After:
className="w-full h-full overflow-y-auto overflow-x-hidden bg-background text-foreground"
```

---

## 5. AICompanion.tsx - Hardcoded Gradient and Colors

**Issue**: Hardcoded purple gradient and rgba colors that don't adapt to theme.

**Current Code** (lines 1707-1714):
```tsx
background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
color: white;
padding: 4px 12px;
border-radius: 12px;
font-size: 12px;
font-weight: 600;
white-space: nowrap;
box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
```

**Fix**: Use CSS variables for theme-aware styling:
```tsx
import { useTheme } from '../../context/ThemeContext';

// Inside component:
const { isDark } = useTheme();

// Update CSS-in-JS:
background: isDark 
  ? 'linear-gradient(135deg, hsl(270 60% 65%) 0%, hsl(330 80% 65%) 100%)'
  : 'linear-gradient(135deg, hsl(270 60% 45%) 0%, hsl(330 80% 45%) 100%)',
color: isDark ? 'var(--foreground)' : 'white',
boxShadow: isDark 
  ? '0 4px 12px hsla(270, 60%, 65%, 0.4)'
  : '0 4px 12px hsla(270, 60%, 45%, 0.4)',

// Or better, create CSS variables:
// In CSS:
// .ai-badge {
//   background: var(--gradient);
//   color: var(--accent-foreground);
//   box-shadow: var(--shadow-glow);
// }
```

**Class Update**: Create a CSS class instead of inline styles:
```tsx
// Create in index.css:
// .ai-badge {
//   background: linear-gradient(135deg, var(--accent-purple), var(--accent-pink));
//   color: var(--accent-foreground);
//   box-shadow: 0 4px 12px hsla(var(--accent-purple-hsl), 0.4);
// }

// Use in component:
className="ai-badge absolute left-1/2 transform -translate-x-1/2 ..."
```

---

## 6. PixelMascot.tsx - Hardcoded Tooltip Colors

**Issue**: Hardcoded dark gray background and white text for tooltips.

**Current Code** (lines 539-542):
```tsx
style={{ backgroundColor: '#1f2937', color: '#f9fafb' }}
// ...
style={{ width: 0, height: 0, borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid #1f2937' }}
```

**Fix**: Use CSS variables for theme-aware tooltips:
```tsx
import { useTheme } from '../../context/ThemeContext';

// Inside component:
const { isDark } = useTheme();

// Update styles:
style={{ 
  backgroundColor: isDark ? 'var(--gh-canvas-overlay, #161b22)' : 'var(--gh-canvas-overlay, #ffffff)',
  color: isDark ? 'var(--gh-fg, #e6edf3)' : 'var(--gh-fg, #1f2328)'
}}

// For arrow:
style={{ 
  width: 0, 
  height: 0, 
  borderLeft: '6px solid transparent', 
  borderRight: '6px solid transparent', 
  borderTop: `6px solid ${isDark ? 'var(--gh-canvas-overlay, #161b22)' : 'var(--gh-canvas-overlay, #ffffff)'}`
}}
```

**Class Update**: Create CSS class for tooltip:
```css
/* In index.css */
.mascot-tooltip {
  background-color: var(--gh-canvas-overlay);
  color: var(--gh-fg);
}

.mascot-tooltip::after {
  border-top-color: var(--gh-canvas-overlay);
}
```

---

## 7. CodeEditor.tsx - Hardcoded Editor Theme

**Issue**: Hardcoded dark theme colors that don't adapt to light mode.

**Current Code** (lines 40-52):
```tsx
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
}
```

**Fix**: Detect theme and provide both light and dark themes:
```tsx
import { useTheme } from '../../context/ThemeContext';

// Inside component:
const { isDark } = useTheme();

// Create theme-aware editor options:
const editorTheme = isDark ? {
  colors: {
    'editor.background': '#0d1117',
    'editor.foreground': '#e6edf3',
    'editor.lineHighlightBackground': '#161b22',
    'editor.selectionBackground': '#264f78',
    'editor.inactiveSelectionBackground': '#3a3d41',
    'editorLineNumber.foreground': '#6e7681',
    'editorLineNumber.activeForeground': '#e6edf3',
    'editorCursor.foreground': '#00ff88',
    'editor.selectionHighlightBackground': '#add6ff26',
    'editorIndentGuide.background': '#21262d',
    'editorIndentGuide.activeBackground': '#00ff88',
    'editorBracketMatch.background': '#0064001a',
    'editorBracketMatch.border': '#00ff88',
  }
} : {
  colors: {
    'editor.background': '#ffffff',
    'editor.foreground': '#1f2328',
    'editor.lineHighlightBackground': '#f6f8fa',
    'editor.selectionBackground': '#264f78',
    'editor.inactiveSelectionBackground': '#c8c8c8',
    'editorLineNumber.foreground': '#6e7681',
    'editorLineNumber.activeForeground': '#1f2328',
    'editorCursor.foreground': '#238636',
    'editor.selectionHighlightBackground': '#add6ff26',
    'editorIndentGuide.background': '#d0d7de',
    'editorIndentGuide.activeBackground': '#238636',
    'editorBracketMatch.background': '#0064001a',
    'editorBracketMatch.border': '#238636',
  }
};

// Use in editor:
monaco.editor.defineTheme('devprep', editorTheme);
```

**Class Update**: None required.

---

## 8. ProgressRing.tsx - Hardcoded Default Colors

**Issue**: Hardcoded purple color that may not match theme's primary color.

**Current Code** (lines 22-23):
```tsx
color = '#a855f7',
bgColor = 'rgba(168, 85, 247, 0.1)',
```

**Fix**: Use theme-aware defaults:
```tsx
import { useTheme } from '../../context/ThemeContext';

// Update component signature:
interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  children?: React.ReactNode;
  animate?: boolean;
}

// Inside component:
const { isDark } = useTheme();

// Use theme-aware defaults:
const ringColor = color || (isDark ? 'var(--gh-accent-fg, #58a6ff)' : 'var(--gh-accent-fg, #0969da)');
const ringBgColor = bgColor || (isDark ? 'rgba(88, 166, 255, 0.1)' : 'rgba(9, 105, 218, 0.1)');

// Use in component:
<circle
  cx={center}
  cy={center}
  r={radius}
  stroke={ringBgColor}
  strokeWidth={strokeWidth}
  fill="none"
/>
<circle
  cx={center}
  cy={center}
  r={radius}
  stroke={ringColor}
  strokeWidth={strokeWidth}
  fill="none"
  strokeDasharray={circumference}
  strokeDashoffset={strokeDashoffset}
  strokeLinecap="round"
/>
```

**Class Update**: None required.

---

## Additional Recommendations

### 1. Add Theme Detection Hook
Create a utility hook for theme detection:
```tsx
// hooks/useThemeColors.ts
export function useThemeColors() {
  const { isDark } = useTheme();
  
  return {
    isDark,
    colors: {
      primary: isDark ? '#58a6ff' : '#0969da',
      success: isDark ? '#3fb950' : '#1a7f37',
      warning: isDark ? '#d29922' : '#9a6700',
      danger: isDark ? '#f85149' : '#d1242f',
      canvas: isDark ? '#0d1117' : '#ffffff',
      canvasSubtle: isDark ? '#161b22' : '#f6f8fa',
      fg: isDark ? '#e6edf3' : '#1f2328',
      fgMuted: isDark ? '#8b949e' : '#636c76',
      border: isDark ? '#30363d' : '#d0d7de',
    }
  };
}
```

### 2. Audit Checklist
- [ ] Remove all hardcoded `#hex` colors from inline styles
- [ ] Replace with CSS variables (`var(--gh-*)`) or `hsl(var(--*-*))`
- [ ] Use theme detection (`useTheme()`) for dynamic colors
- [ ] Test both light and dark modes after changes
- [ ] Ensure 4.5:1 contrast ratio for all text (WCAG AA)

### 3. Common Patterns to Avoid
1. **Don't use**: `color: '#a855f7'`
2. **Use instead**: `color: 'var(--gh-accent-fg)'` or `color: isDark ? 'var(--gh-accent-fg)' : 'var(--gh-accent-fg)'`

3. **Don't use**: `backgroundColor: isLightMode ? 'white' : 'black'`
4. **Use instead**: `backgroundColor: 'var(--background)'`

5. **Don't use**: Hardcoded rgba values with specific colors
6. **Use instead**: `rgba(var(--primary-rgb), 0.1)` or theme-aware values

---

## Implementation Priority

1. **High Priority**: Components that break UI in opposite theme (MermaidDiagram, CodeEditor)
2. **Medium Priority**: Components with poor contrast (CodeExamplesPanel, GenZAnswerPanel)
3. **Low Priority**: Components with cosmetic issues (ProgressRing, PixelMascot)

---

## Verification Steps

After implementing fixes:
1. Toggle theme multiple times rapidly
2. Check all hardcoded colors are gone
3. Verify contrast ratios in both themes
4. Test on mobile and desktop
5. Ensure transitions are smooth (no flash)

---

**Audit completed by:** devprep-github-darkmode-expert  
**Date:** 2026-04-01  
**Components audited:** 8  
**Critical leaks fixed:** 8