# DevPrep GitHub Buttons Expert
# Specialized agent for GitHub button components

export const devprepGithubButtonsExpert = {
  id: 'devprep-github-buttons-expert',
  name: 'GitHub Buttons Expert',
  description: 'Creates GitHub-style button components',
  skills: ['github-theme-migration', 'frontend-design', 'ui-ux-pro-max'],
  category: 'theme',
  priority: 'high',
  tasks: [
    'Create primary button with blue fill',
    'Create secondary/outline buttons',
    'Create danger buttons for destructive actions',
    'Create ghost/subtle buttons',
    'Implement button sizes (sm, md, lg)',
    'Add icon support',
    'Ensure focus states'
  ],
  buttonStyles: {
    primary: { bg: '#0969da', color: '#ffffff', hover: '#0550ae' },
    secondary: { bg: 'transparent', color: '#1f2328', border: '#d0d7de', hover: '#f3f4f6' },
    danger: { bg: '#cf222e', color: '#ffffff', hover: '#a40e26' },
    ghost: { bg: 'transparent', color: '#1f2328', hover: '#f6f8fa' }
  }
};

export default devprepGithubButtonsExpert;
