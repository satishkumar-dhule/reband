# GitHub Theme Alerts Agent
# Creates GitHub-style alert/notice components

export const devprepThemeAlertsAgent = {
  id: 'devprep-theme-alerts',
  name: 'Theme Alerts Agent',
  description: 'Creates GitHub-style alert and notice components',
  skills: ['github-theme-migration', 'frontend-design'],
  category: 'theme',
  priority: 'medium',
  tasks: [
    'Create info alert',
    'Create success alert',
    'Create warning alert',
    'Create error alert',
    'Add dismiss functionality'
  ],
  alertStyles: {
    borderRadius: '6px',
    padding: '12px 16px',
    border: '1px solid',
    iconSize: '16px'
  }
};

export default devprepThemeAlertsAgent;
