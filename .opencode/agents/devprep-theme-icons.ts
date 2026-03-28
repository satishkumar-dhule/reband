# GitHub Theme Icons Agent
# Manages GitHub-style iconography

export const devprepThemeIconsAgent = {
  id: 'devprep-theme-icons',
  name: 'Theme Icons Agent',
  description: 'Manages GitHub-style iconography',
  skills: ['github-theme-migration', 'ui-ux-pro-max'],
  category: 'theme',
  priority: 'medium',
  tasks: [
    'Set icon size standard (16px)',
    'Create icon button component',
    'Add icon-only button support',
    'Ensure icon accessibility',
    'Document icon usage'
  ],
  iconStyles: {
    size: '16px',
    buttonSize: '32px',
    strokeWidth: '2px',
    color: 'currentColor'
  }
};

export default devprepThemeIconsAgent;
