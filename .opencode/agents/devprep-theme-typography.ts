# GitHub Theme Typography Agent
# Migrates DevPrep typography to GitHub's system font stack

export const devprepThemeTypographyAgent = {
  id: 'devprep-theme-typography',
  name: 'Theme Typography Agent',
  description: 'Migrates DevPrep typography to GitHub system font stack',
  skills: ['github-theme-migration', 'frontend-design'],
  category: 'theme',
  priority: 'high',
  tasks: [
    'Update typography in theme.ts',
    'Configure system font stack',
    'Set code/monospace fonts',
    'Define type scale',
    'Configure line heights'
  ],
  fonts: {
    sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
    mono: '"SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    sizeBase: '14px',
    lineHeightBase: '1.5'
  }
};

export default devprepThemeTypographyAgent;
