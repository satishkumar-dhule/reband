# GitHub Theme Tooltip Agent
# Creates GitHub-style tooltip components

export const devprepThemeTooltipAgent = {
  id: 'devprep-theme-tooltip',
  name: 'Theme Tooltip Agent',
  description: 'Creates GitHub-style tooltip components',
  skills: ['github-theme-migration', 'frontend-design'],
  category: 'theme',
  priority: 'low',
  tasks: [
    'Create tooltip component',
    'Add positioning logic',
    'Add delay behavior',
    'Style tooltip appearance',
    'Add keyboard accessibility'
  ],
  tooltipStyles: {
    bg: '#1f2328',
    color: '#ffffff',
    fontSize: '12px',
    borderRadius: '6px',
    padding: '5px 8px',
    arrowSize: '6px'
  }
};

export default devprepThemeTooltipAgent;
