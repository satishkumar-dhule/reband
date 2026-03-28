# SRS Page Redesign - Design Specification

## Executive Summary

This document specifies the complete redesign of the Spaced Repetition System (SRS) review page in DevPrep. The redesign focuses on modernizing UI/UX and accessibility while maintaining a feature-rich but organized interface. A team of 10 specialized engineers will work in parallel using an atomic design system approach to deliver the redesign within 4 weeks.

## 1. Project Overview

### Current State
The existing SRS page (`/review` route) is implemented in `ReviewSessionGenZ.tsx` with:
- Mobile-first, Gen-Z themed interface
- Swipe-style cards with rating buttons (Again, Hard, Good, Easy)
- Gamification system (XP, levels, streaks, mastery)
- Checkpoint tests every N questions
- Client-side SRS algorithm (modified SM-2) in `spaced-repetition.ts`

### Redesign Goals
1. **Primary**: Modernize UI/UX & accessibility
2. **Target**: Individual learners (B2C)
3. **Approach**: Feature-rich but organized interface
4. **Timeline**: 4-week quick redesign
5. **Team**: 10 specialized engineers working in parallel

## 2. Architecture: Atomic Design System

### Core Principles
- **Design Tokens**: Centralized variables for colors, typography, spacing, animations
- **Accessibility First**: WCAG 2.1 AA compliance built into every component
- **Mobile-First**: Progressive enhancement from mobile to desktop
- **Performance**: GPU-accelerated animations, optimized bundle size
- **Theme Support**: Light/dark modes with smooth transitions

### Directory Structure
```
src/design-system/
├── tokens/          # Design variables
│   ├── colors.ts    # Color palette and semantic colors
│   ├── typography.ts # Font families, sizes, weights
│   ├── spacing.ts   # Spacing scale and breakpoints
│   └── animations.ts # Timing functions, durations
├── atoms/           # Basic UI elements
├── molecules/       # Composite components
├── organisms/       # Complex sections
├── templates/       # Page layouts
└── pages/           # Complete pages
```

## 3. Component Breakdown

### 3.1 Atoms (Basic UI Elements)

#### Button Component
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'rating' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  rating?: 'again' | 'hard' | 'good' | 'easy';
  icon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  onClick: () => void;
}
```

#### Rating Buttons (Specific to SRS)
- **Again**: Red theme, shows "1 day" interval preview
- **Hard**: Orange theme, shows adjusted interval
- **Good**: Green theme, shows standard interval
- **Easy**: Blue theme, shows extended interval

#### Other Atoms
- **Text**: Headings, body, captions, code
- **Icon**: Lucide icons with consistent sizing
- **Badge**: XP, level, mastery indicators
- **ProgressBar**: Linear and circular variants
- **Card**: Base container with elevation variants
- **Avatar**: User profile with status
- **Timer**: Review countdown/session timer

### 3.2 Molecules (Composite Components)

#### RatingButton
```typescript
interface RatingButtonProps {
  rating: 'again' | 'hard' | 'good' | 'easy';
  intervalPreview: string;
  disabled?: boolean;
  onRate: (rating: ConfidenceRating) => void;
}
```

#### ProgressIndicator
- Visual progress bar with percentage
- Question counter (e.g., "5/20")
- Session time remaining

#### StatsWidget
- Due today count
- Current streak
- Mastery level
- XP gained this session

#### CardHeader
- Question number and difficulty badge
- Channel/topic indicator
- Timer remaining

#### CardContent
- Question display with syntax highlighting
- Expandable answer section
- Code interpretation with line-by-line breakdown

#### ActionRow
- Save/bookmark button
- Share button
- Report button
- Add to SRS button

### 3.3 Organisms (Complex Sections)

#### ReviewCard (Main Component)
```typescript
interface ReviewCardProps {
  card: ReviewCardData;
  onRate: (rating: ConfidenceRating) => void;
  onSave: () => void;
  onShare: () => void;
  progress: SessionProgress;
}
```

**Features:**
- Swipe gestures for navigation
- Flip animation between question/answer
- Haptic feedback on rating selection
- Auto-advance after rating (configurable)

#### ProgressTracker
- Visual timeline of session progress
- Checkpoint indicators
- Mastery level progression
- Streak visualization

#### StatsDashboard
- Overview of SRS statistics
- Due cards breakdown
- Learning progress charts
- Performance trends

#### StreakDisplay
- Current streak counter
- Streak history visualization
- Milestone celebrations

#### MasteryIndicator
- Visual mastery level (0-5)
- Progress to next level
- Mastery history timeline

#### CheckpointQuiz
- Interstitial quiz every N cards
- Quick knowledge validation
- Progress reinforcement

### 3.4 Templates & Pages

#### ReviewTemplate
```typescript
interface ReviewTemplateProps {
  children: ReactNode;
  sidebar?: ReactNode;
  header?: ReactNode;
}
```

**Layout:**
- Mobile: Full-screen review card
- Tablet: Card + sidebar stats
- Desktop: Card + sidebar + progress panel

#### StatsTemplate
- Dashboard layout with grid system
- Responsive card grid
- Chart containers

#### SRSReviewPage
Complete SRS review experience combining all components.

## 4. Team Organization & Work Distribution

### Team Structure (10 Engineers)

| Role | Engineer | Focus Area | Key Responsibilities |
|------|----------|------------|---------------------|
| **Design System Lead** | `frontend-designer` | Architecture & Tokens | Overall design system structure, design tokens, component APIs |
| **Atom Specialist 1** | `ui-ux-expert` | Core Atoms | Button, Text, Icon, Badge - foundational elements |
| **Atom Specialist 2** | `web-reviewer` | Input & Feedback | ProgressBar, Card, Avatar, Timer - interactive atoms |
| **Molecule Specialist 1** | `react-optimizer` | Rating & Progress | RatingButton, ProgressIndicator, StatsWidget |
| **Molecule Specialist 2** | `copywriter` | Content Display | CardHeader, CardContent, ActionRow - content-focused |
| **Organism Specialist 1** | `brainstormer` | Core Review | ReviewCard, ProgressTracker - main review flow |
| **Organism Specialist 2** | `db-optimizer` | Stats & Analytics | StatsDashboard, StreakDisplay, MasteryIndicator |
| **Accessibility Specialist** | `ui-ux-expert` | WCAG Compliance | Screen reader support, keyboard navigation, contrast |
| **Performance Specialist** | `react-optimizer` | Optimization | Bundle size, animations, code splitting |
| **Integration Specialist** | `frontend-designer` | Testing & Integration | Component integration, storybook, end-to-end testing |

### Parallel Workstreams

#### Week 1: Foundation & Atoms
- **Days 1-2**: Design system setup
  - Create design tokens
  - Set up Storybook
  - Establish component API patterns
- **Days 3-5**: Atom development (parallel)
  - `frontend-designer` (Design System Lead): Button variants, Icon system
  - `ui-ux-expert` (Atom Specialist 1): Text styles, Badge components
  - `web-reviewer` (Atom Specialist 2): Card, Avatar, Timer atoms
  - `ui-ux-expert` (Accessibility Specialist): ARIA patterns, focus management

#### Week 2: Molecules & Organisms Start
- **Days 1-2**: Molecule development
  - `react-optimizer` (Molecule Specialist 1): RatingButton with interval tooltips
  - `copywriter` (Molecule Specialist 2): CardContent with syntax highlighting
- **Days 3-5**: Organism development begins
  - `brainstormer` (Organism Specialist 1): ReviewCard main component
  - `db-optimizer` (Organism Specialist 2): StatsDashboard
  - `react-optimizer` (Performance Specialist): Animation optimization, GPU acceleration

#### Week 3: Organisms & Templates
- **Days 1-2**: Complete organisms
  - `brainstormer` (Organism Specialist 1): ProgressTracker with checkpoints
  - `db-optimizer` (Organism Specialist 2): StreakDisplay, MasteryIndicator
- **Days 3-5**: Templates & page integration
  - `frontend-designer` (Design System Lead): ReviewTemplate
  - `frontend-designer` (Integration Specialist): Connect all components, state management

#### Week 4: Testing & Polish
- **Days 1-2**: Accessibility audit & fixes
  - WCAG 2.1 AA compliance testing
  - Screen reader testing
  - Keyboard navigation verification
- **Days 3-4**: Performance optimization
  - Bundle size analysis
  - Animation performance testing
  - Memory leak detection
- **Day 5**: Final integration & documentation
  - End-to-end testing
  - Component documentation
  - Design system documentation

## 5. Accessibility & UX Improvements

### 5.1 Accessibility Enhancements

#### Keyboard Navigation
- **Full keyboard control** for review flow
- **Custom shortcuts**:
  - `1-4`: Rate card (Again, Hard, Good, Easy)
  - `Space`: Reveal answer
  - `Arrow keys`: Navigate between cards
  - `S`: Save/bookmark
  - `H`: Show hint
- **Focus management** between cards and modals

#### Screen Reader Support
- **ARIA labels** for all interactive elements
- **Live regions** for dynamic content updates
- **Semantic HTML** structure
- **Screen reader announcements** for:
  - Card changes
  - Rating selections
  - Progress updates
  - Streak achievements

#### Visual Accessibility
- **WCAG AA color contrast** ratios (4.5:1 for text, 3:1 for UI)
- **Reduced motion mode** for animations
- **High contrast theme** option
- **Focus indicators** with 2px minimum outline
- **Color-blind friendly** palette with distinct hues

#### Motor Accessibility
- **Large touch targets** (minimum 44x44px)
- **Voice control** integration ready
- **Switch control** compatibility
- **Adjustable timing** for auto-advance

### 5.2 UX Modernization

#### Mobile-First Design
- **Thumb-friendly navigation** zones (bottom 1/3 of screen)
- **Swipe gestures** for card navigation
- **Haptic feedback** on rating selection
- **Safe area support** for notched devices

#### Performance Optimizations
- **GPU-accelerated** animations using `transform` and `opacity`
- **Skeleton loading** states
- **Progressive card** loading
- **Optimized images** with lazy loading

#### Visual Hierarchy
- **Clear typography scale** (1.25 modular scale)
- **Consistent spacing system** (8px base unit)
- **Meaningful micro-interactions**
- **Depth and elevation** through shadows

#### Feedback Systems
- **Immediate visual feedback** on actions
- **Progress celebration** animations
- **Error state** illustrations
- **Loading states** with skeleton screens

### 5.3 Specific SRS Page Improvements

#### Review Card Redesign
- **Clean, distraction-free** interface
- **Optimal reading width** (60-75 characters per line)
- **Code syntax highlighting** with theme support
- **Expandable sections** for detailed explanations

#### Rating System
- **Color-coded buttons** with icons
- **Interval preview** on hover/touch
- **Haptic feedback** on rating selection
- **Confidence visualization** (color intensity)

#### Progress Visualization
- **Animated progress bar** with easing
- **Milestone celebrations** (confetti, sounds)
- **Streak visualization** with fire animation
- **Mastery level** progression display

## 6. Technical Implementation

### 6.1 State Management
```typescript
interface SRSState {
  currentCard: ReviewCard | null;
  sessionProgress: SessionProgress;
  stats: SRSStats;
  settings: ReviewSettings;
  theme: 'light' | 'dark' | 'system';
}
```

### 6.2 Animation Strategy
- **CSS Transitions** for simple state changes
- **Framer Motion** for complex animations
- **Web Animations API** for performance-critical animations
- **GPU acceleration** via `transform` and `will-change`

### 6.3 Performance Targets
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms
- **Bundle size**: < 150KB gzipped for SRS page

### 6.4 Testing Strategy
- **Unit tests** for all components (Jest + Testing Library)
- **Visual regression tests** (Chromatic)
- **Accessibility tests** (axe-core, Lighthouse)
- **Performance tests** (Lighthouse CI)
- **End-to-end tests** (Playwright)

## 7. Migration Strategy

### 7.1 Gradual Migration
1. **Phase 1**: Create design system in isolation
2. **Phase 2**: Build new SRS page alongside existing
3. **Phase 3**: A/B test new vs old
4. **Phase 4**: Migrate users to new page
5. **Phase 5**: Deprecate old page

### 7.2 Backward Compatibility
- **Same SRS algorithm** (no changes to spaced-repetition.ts)
- **Same data structure** (localStorage format unchanged)
- **Same routes** (maintain /review URL)
- **Same API** (component props compatible where possible)

## 8. Success Metrics

### 8.1 User Experience
- **Accessibility score**: 100/100 Lighthouse
- **Performance score**: > 90 Lighthouse
- **User satisfaction**: > 4.5/5 rating
- **Task completion rate**: > 95%

### 8.2 Technical Metrics
- **Bundle size**: < 150KB gzipped
- **Animation performance**: 60fps on mid-range devices
- **Memory usage**: < 50MB for SRS page
- **Zero critical accessibility** issues

### 8.3 Business Metrics
- **Review completion rate**: Increase by 20%
- **Session duration**: Increase by 15%
- **User retention**: Improve by 10%
- **Daily active users**: Increase by 25%

## 9. Risks & Mitigations

### 9.1 Technical Risks
- **Risk**: Animation performance on low-end devices
- **Mitigation**: Progressive enhancement, reduced motion mode

- **Risk**: Bundle size increase
- **Mitigation**: Code splitting, tree shaking, bundle analysis

- **Risk**: Accessibility regressions
- **Mitigation**: Automated testing, manual audits

### 9.2 Project Risks
- **Risk**: 4-week timeline too aggressive
- **Mitigation**: Prioritize core features, defer nice-to-haves

- **Risk**: Team coordination challenges
- **Mitigation**: Daily standups, clear ownership, design system lead

- **Risk**: Design system complexity
- **Mitigation**: Start simple, iterate based on needs

## 10. Next Steps

### Immediate Actions
1. **Approve this design document**
2. **Create implementation plan** (via writing-plans skill)
3. **Set up development environment**
4. **Begin Week 1: Foundation & Atoms**

### Deliverables
- ✅ Design tokens (colors, typography, spacing)
- ✅ Storybook setup
- ✅ Atom components (Button, Text, Icon, Badge)
- ✅ Component documentation
- ✅ Accessibility audit report
- ✅ Performance benchmark report

---

**Document Version**: 1.0  
**Date**: 2026-03-28  
**Status**: Draft - Awaiting User Review