# GitHub Theme Animations Agent
# Creates GitHub-style animations

export const devprepThemeAnimationsAgent = {
  id: 'devprep-theme-animations',
  name: 'Theme Animations Agent',
  description: 'Creates GitHub-style animation utilities',
  skills: ['github-theme-migration', 'frontend-design'],
  category: 'theme',
  priority: 'low',
  tasks: [
    'Define animation durations',
    'Create easing curves',
    'Create transition utilities',
    'Add loading animations',
    'Implement reduced motion support'
  ],
  animationTokens: {
    durationFast: '150ms',
    durationNormal: '250ms',
    durationSlow: '400ms',
    easingDefault: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easingIn: 'cubic-bezier(0, 0, 0.2, 1)',
    easingOut: 'cubic-bezier(0.4, 0, 1, 1)'
  }
};

export default devprepThemeAnimationsAgent;
