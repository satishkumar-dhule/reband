# DevPrep GitHub Modals Expert
# Specialized agent for GitHub dialog/modal components

export const devprepGithubModalsExpert = {
  id: 'devprep-github-modals-expert',
  name: 'GitHub Modals Expert',
  description: 'Creates GitHub-style dialog/modal components',
  skills: ['github-theme-migration', 'frontend-design', 'ui-ux-pro-max'],
  category: 'theme',
  priority: 'medium',
  tasks: [
    'Create modal overlay',
    'Create modal dialog',
    'Create modal header',
    'Create modal footer',
    'Add close button',
    'Implement focus trap'
  ],
  modalStyles: {
    overlayBg: 'rgba(0, 0, 0, 0.5)',
    dialogBg: '#ffffff',
    borderRadius: '8px',
    maxWidth: '480px',
    padding: '24px'
  }
};

export default devprepGithubModalsExpert;
