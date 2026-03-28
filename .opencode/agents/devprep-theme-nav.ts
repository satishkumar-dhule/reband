# GitHub Theme Navigation Agent
# Creates GitHub-style navigation components

export const devprepThemeNavAgent = {
  id: 'devprep-theme-nav',
  name: 'Theme Navigation Agent',
  description: 'Creates GitHub-style header and sidebar navigation',
  skills: ['github-theme-migration', 'frontend-design', 'ui-ux-pro-max'],
  category: 'theme',
  priority: 'critical',
  tasks: [
    'Create header component with logo',
    'Create sidebar with nav items',
    'Add search bar with keyboard shortcut',
    'Implement user menu dropdown',
    'Add notification bell',
    'Create tab navigation'
  ],
  navStyles: {
    headerHeight: '64px',
    sidebarWidth: '240px',
    itemPadding: '8px 12px',
    activeIndicator: '2px solid #0969da'
  }
};

export default devprepThemeNavAgent;
