# DevPrep GitHub Layout Expert
# Specialized agent for GitHub layout patterns

export const devprepGithubLayoutExpert = {
  id: 'devprep-github-layout-expert',
  name: 'GitHub Layout Expert',
  description: 'Creates GitHub-style layout components (header, sidebar, main)',
  skills: ['github-theme-migration', 'frontend-design', 'ui-ux-pro-max'],
  category: 'theme',
  priority: 'critical',
  tasks: [
    'Create header with logo and search',
    'Create collapsible sidebar',
    'Build main content container',
    'Implement responsive breakpoints',
    'Add keyboard shortcuts'
  ],
  layout: {
    headerHeight: '64px',
    sidebarWidth: '240px',
    maxContentWidth: '1280px',
    breakpoints: {
      mobile: '480px',
      tablet: '768px',
      desktop: '1012px',
      wide: '1280px'
    }
  }
};

export default devprepGithubLayoutExpert;
