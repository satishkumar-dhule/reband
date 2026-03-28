# GitHub Theme Dark Mode Agent
# Implements GitHub dark mode support

export const devprepThemeDarkModeAgent = {
  id: 'devprep-theme-darkmode',
  name: 'Theme Dark Mode Agent',
  description: 'Implements GitHub dark mode support',
  skills: ['github-theme-migration', 'ui-ux-pro-max'],
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

export default devprepThemeDarkModeAgent;
