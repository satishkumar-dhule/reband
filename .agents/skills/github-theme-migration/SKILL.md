# Skill: github-theme-migration

# GitHub-Like Theme Migration for DevPrep

This skill provides instructions for migrating the DevPrep application to a GitHub-inspired design language. It covers the visual design system, component patterns, and implementation guidelines.

## Design Principles

### GitHub Design Language

1. **Color Palette**
   - Background Dark: `#0d1117` (GitHub dark)
   - Background Light: `#ffffff`
   - Border: `#d0d7de`
   - Text Primary: `#24292f`
   - Text Secondary: `#57606a`
   - Accent Blue: `#0969da`
   - Success Green: `#1a7f37`
   - Warning Orange: `#bf8700`
   - Danger Red: `#cf222e`

2. **Typography**
   - Font Family: `-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif`
   - Code Font: `"SFMono-Regular", Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`
   - Headings: System font stack with 600 weight
   - Body: 14px base, 1.5 line-height

3. **Spacing System**
   - Base unit: 4px
   - Component padding: 8px, 12px, 16px
   - Section gaps: 24px, 32px
   - Border radius: 6px (buttons), 8px (cards), 12px (modals)

4. **Components**
   - Buttons: Solid fill with hover states, outlined variants
   - Input fields: Bordered with focus rings
   - Cards: Subtle borders, no heavy shadows
   - Navigation: Sidebar with icons, top bar with search

### Key GitHub Patterns

1. **Header/Navigation**
   - Organization logo/name on left
   - Search bar with keyboard shortcut hint (/)
   - Navigation links: Pull requests, Issues, Marketplace, Explore
   - User menu with avatar on right

2. **Sidebar**
   - Collapsible sections
   - Active state with background highlight
   - Icon + text navigation items
   - Nested items with indentation

3. **Main Content Area**
   - Max-width container (1280px)
   - Tabs for sub-navigation
   - Breadcrumbs for hierarchy
   - Action buttons in header

4. **Cards/Widgets**
   - Border-based design
   - Header with title and actions
   - Subtle hover effects
   - Count badges

5. **Tables**
   - Clean borders
   - Hover row highlighting
   - Sortable column headers
   - Pagination controls

## Migration Checklist

### Phase 1: Core Theme
- [ ] Update color palette in theme.ts
- [ ] Update typography settings
- [ ] Configure component defaults
- [ ] Update CSS variables

### Phase 2: Layout Components
- [ ] Header component
- [ ] Sidebar navigation
- [ ] Main content container
- [ ] Footer

### Phase 3: UI Components
- [ ] Buttons (primary, secondary, danger, outline)
- [ ] Form inputs
- [ ] Cards
- [ ] Tables
- [ ] Tabs
- [ ] Badges/Chips
- [ ] Modal/Dialogs

### Phase 4: Page Updates
- [ ] Dashboard
- [ ] Learning Paths
- [ ] Code Practice
- [ ] Interview Simulator
- [ ] Voice Practice
- [ ] Flashcards
- [ ] Analytics
- [ ] Community
- [ ] Job Tracker
- [ ] Settings

### Phase 5: Dark Mode
- [ ] Implement dark/light toggle
- [ ] Update all components for both themes
- [ ] Respect system preference

## Implementation Notes

- Use CSS custom properties for theming
- Implement smooth transitions between themes
- Maintain accessibility contrast ratios
- Test responsive breakpoints
- Ensure keyboard navigation works

## File Locations

- Theme: `src/theme.ts`
- Components: `src/components/`
- Layout: `src/components/layout/`
- Pages: `src/pages/`
