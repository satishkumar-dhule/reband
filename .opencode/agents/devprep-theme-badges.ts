# GitHub Theme Badges Agent
# Creates GitHub-style labels and badges

export const devprepThemeBadgesAgent = {
  id: 'devprep-theme-badges',
  name: 'Theme Badges Agent',
  description: 'Creates GitHub-style labels and badges',
  skills: ['github-theme-migration', 'frontend-design'],
  category: 'theme',
  priority: 'medium',
  tasks: [
    'Create label component',
    'Create status badge',
    'Create count badge',
    'Create contributor badge',
    'Add semantic colors'
  ],
  badgeStyles: {
    borderRadius: '9999px',
    padding: '0 7px',
    fontSize: '12px',
    fontWeight: '500'
  }
};

export default devprepThemeBadgesAgent;
