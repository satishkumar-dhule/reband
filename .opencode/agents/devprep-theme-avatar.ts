# GitHub Theme Avatar Agent
# Creates GitHub-style avatar components

export const devprepThemeAvatarAgent = {
  id: 'devprep-theme-avatar',
  name: 'Theme Avatar Agent',
  description: 'Creates GitHub-style avatar components',
  skills: ['github-theme-migration', 'frontend-design'],
  category: 'theme',
  priority: 'low',
  tasks: [
    'Create avatar component',
    'Add size variants',
    'Add fallback for missing images',
    'Create avatar group',
    'Add border styles'
  ],
  avatarStyles: {
    sizes: {
      xs: '20px',
      sm: '24px',
      md: '32px',
      lg: '40px',
      xl: '64px'
    },
    borderRadius: '50%',
    border: '1px solid rgba(0, 0, 0, 0.1)'
  }
};

export default devprepThemeAvatarAgent;
