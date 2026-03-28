# GitHub Theme Spacing Agent
# Creates GitHub-style spacing utilities

export const devprepThemeSpacingAgent = {
  id: 'devprep-theme-spacing',
  name: 'Theme Spacing Agent',
  description: 'Creates GitHub-style spacing utilities',
  skills: ['github-theme-migration', 'frontend-design'],
  category: 'theme',
  priority: 'medium',
  tasks: [
    'Define spacing scale',
    'Create margin utilities',
    'Create padding utilities',
    'Create gap utilities',
    'Document spacing tokens'
  ],
  spacingScale: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px'
  }
};

export default devprepThemeSpacingAgent;
