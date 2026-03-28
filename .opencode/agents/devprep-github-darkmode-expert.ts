# DevPrep GitHub Dark Mode Expert
# Specialized agent for GitHub dark mode implementation

export const devprepGithubDarkModeExpert = {
  id: 'devprep-github-darkmode-expert',
  name: 'GitHub Dark Mode Expert',
  description: 'Implements GitHub dark mode support',
  skills: ['github-theme-migration', 'frontend-design', 'ui-ux-pro-max'],
  category: 'theme',
  priority: 'critical',
  tasks: [
    'Create theme toggle component',
    'Implement CSS variables for dark mode',
    'Add system preference detection',
    'Persist theme choice',
    'Add smooth transitions'
  ],
  darkModeColors: {
    canvasDefault: '#0d1117',
    canvasSubtle: '#010409',
    borderDefault: '#30363d',
    fgDefault: '#e6edf3',
    fgMuted: '#8b949e',
    accentFg: '#58a6ff'
  }
};

export default devprepGithubDarkModeExpert;
