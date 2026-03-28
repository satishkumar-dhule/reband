# GitHub Theme Tabs Agent
# Creates GitHub-style tab navigation

export const devprepThemeTabsAgent = {
  id: 'devprep-theme-tabs',
  name: 'Theme Tabs Agent',
  description: 'Creates GitHub-style tab navigation',
  skills: ['github-theme-migration', 'frontend-design'],
  category: 'theme',
  priority: 'medium',
  tasks: [
    'Create tab list container',
    'Create tab item',
    'Create underline indicator',
    'Add tab panels',
    'Implement keyboard navigation'
  ],
  tabStyles: {
    borderBottom: '1px solid #d0d7de',
    itemPadding: '12px 16px',
    activeBorder: '2px solid #0969da',
    fontSize: '14px'
  }
};

export default devprepThemeTabsAgent;
