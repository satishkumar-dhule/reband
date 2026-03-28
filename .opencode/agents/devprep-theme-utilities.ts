# GitHub Theme Utilities Agent
# Creates GitHub-style utility classes

export const devprepThemeUtilitiesAgent = {
  id: 'devprep-theme-utilities',
  name: 'Theme Utilities Agent',
  description: 'Creates GitHub-style CSS utility classes',
  skills: ['github-theme-migration', 'frontend-design'],
  category: 'theme',
  priority: 'low',
  tasks: [
    'Create border utilities',
    'Create text utilities',
    'Create display utilities',
    'Create flexbox utilities',
    'Create grid utilities'
  ],
  utilityClasses: {
    border: {
      default: '1px solid #d0d7de',
      radius: '6px'
    },
    text: {
      primary: '#1f2328',
      muted: '#656d76',
      subtle: '#8b949e'
    }
  }
};

export default devprepThemeUtilitiesAgent;
