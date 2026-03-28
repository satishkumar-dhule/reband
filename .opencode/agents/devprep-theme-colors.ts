# GitHub Theme Colors Agent
# Migrates DevPrep color palette to GitHub dark/light themes

export const devprepThemeColorsAgent = {
  id: 'devprep-theme-colors',
  name: 'Theme Colors Agent',
  description: 'Migrates DevPrep color palette to GitHub dark/light themes',
  skills: ['github-theme-migration', 'github-theme-components', 'ui-ux-pro-max'],
  category: 'theme',
  priority: 'critical',
  tasks: [
    'Update theme.ts with GitHub colors',
    'Define CSS custom properties',
    'Create semantic color tokens',
    'Support light/dark mode switching',
    'Ensure WCAG contrast compliance'
  ],
  colorPalette: {
    light: {
      canvasDefault: '#ffffff',
      canvasSubtle: '#f6f8fa',
      borderDefault: '#d0d7de',
      fgDefault: '#1f2328',
      fgMuted: '#656d76',
      accentFg: '#0969da',
      successFg: '#1a7f37',
      dangerFg: '#cf222e',
      warningFg: '#bf8700'
    },
    dark: {
      canvasDefault: '#0d1117',
      canvasSubtle: '#010409',
      canvasInset: '#161b22',
      borderDefault: '#30363d',
      fgDefault: '#e6edf3',
      fgMuted: '#8b949e',
      accentFg: '#58a6ff',
      successFg: '#3fb950',
      dangerFg: '#f85149',
      warningFg: '#d29922'
    }
  }
};

export default devprepThemeColorsAgent;
