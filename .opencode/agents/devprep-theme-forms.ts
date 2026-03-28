# GitHub Theme Forms Agent
# Creates GitHub-style form components

export const devprepThemeFormsAgent = {
  id: 'devprep-theme-forms',
  name: 'Theme Forms Agent',
  description: 'Creates GitHub-style form components',
  skills: ['github-theme-migration', 'frontend-design'],
  category: 'theme',
  priority: 'high',
  tasks: [
    'Create form group',
    'Create form label',
    'Create form helper text',
    'Create form error message',
    'Create form actions'
  ],
  formStyles: {
    labelFontSize: '14px',
    labelFontWeight: '600',
    helperFontSize: '12px',
    errorColor: '#cf222e',
    requiredColor: '#cf222e'
  }
};

export default devprepThemeFormsAgent;
