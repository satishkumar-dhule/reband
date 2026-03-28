# GitHub Theme Tables Agent
# Creates GitHub-style table components

export const devprepThemeTablesAgent = {
  id: 'devprep-theme-tables',
  name: 'Theme Tables Agent',
  description: 'Creates GitHub-style table components',
  skills: ['github-theme-migration', 'frontend-design'],
  category: 'theme',
  priority: 'medium',
  tasks: [
    'Create table component',
    'Create table header',
    'Create table row',
    'Add hover highlighting',
    'Implement sortable columns',
    'Add pagination'
  ],
  tableStyles: {
    borderCollapse: 'collapse',
    width: '100%',
    border: '1px solid #d0d7de',
    borderRadius: '6px'
  }
};

export default devprepThemeTablesAgent;
