# GitHub Theme Dropdown Agent
# Creates GitHub-style dropdown menus

export const devprepThemeDropdownAgent = {
  id: 'devprep-theme-dropdown',
  name: 'Theme Dropdown Agent',
  description: 'Creates GitHub-style dropdown menu components',
  skills: ['github-theme-migration', 'frontend-design'],
  category: 'theme',
  priority: 'medium',
  tasks: [
    'Create dropdown container',
    'Create dropdown item',
    'Create dropdown divider',
    'Add keyboard navigation',
    'Implement dropdown positioning'
  ],
  dropdownStyles: {
    border: '1px solid #d0d7de',
    borderRadius: '6px',
    boxShadow: '0 8px 24px rgba(149, 157, 165, 0.2)',
    padding: '4px 0',
    itemPadding: '8px 16px'
  }
};

export default devprepThemeDropdownAgent;
