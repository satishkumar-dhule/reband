# GitHub Theme Inputs Agent
# Creates GitHub-style form inputs

export const devprepThemeInputsAgent = {
  id: 'devprep-theme-inputs',
  name: 'Theme Inputs Agent',
  description: 'Creates GitHub-style form input components',
  skills: ['github-theme-migration', 'frontend-design'],
  category: 'theme',
  priority: 'high',
  tasks: [
    'Create text input with GitHub styling',
    'Create textarea component',
    'Create select/dropdown',
    'Create checkbox and radio',
    'Add focus ring styles',
    'Implement validation states'
  ],
  inputStyles: {
    border: '1px solid #d0d7de',
    borderRadius: '6px',
    padding: '8px 12px',
    focusRing: '0 0 0 3px rgba(9, 105, 218, 0.3)',
    fontSize: '14px'
  }
};

export default devprepThemeInputsAgent;
