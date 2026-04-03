---
name: frontend-design
description: Create distinctive, production-grade frontend interfaces with high design quality. Use this skill when the user asks to build web components, pages, artifacts, posters, or applications (examples include websites, landing pages, dashboards, React components, HTML/CSS layouts, or when styling/beautifying any web UI). Generates creative, polished code and UI design that avoids generic AI aesthetics.
license: Complete terms in LICENSE.txt
---

This skill guides creation of distinctive, production-grade frontend interfaces that avoid generic "AI slop" aesthetics. Implement real working code with exceptional attention to aesthetic details and creative choices.

The user provides frontend requirements: a component, page, application, or interface to build. They may include context about the purpose, audience, or technical constraints.

## Test Driven Development (TDD)

**ALWAYS follow TDD for frontend components:**

1. **RED** — Write a failing test FIRST that describes the expected UI behavior
2. **GREEN** — Implement minimal code to make the test pass
3. **REFACTOR** — Improve design while keeping tests green

### TDD Frontend Workflow

```
1. Before writing any component code:
   - Write a test file (e.g., Component.test.tsx) with expected behavior
   - Include tests for: render, interactions, accessibility, visual states
   
2. Run tests to verify they FAIL (expected)

3. Implement the component to make tests pass

4. Run tests to verify they PASS

5. Refactor for design quality (aesthetics, animations, polish)

6. Ensure all tests still pass
```

### Test Requirements

- Every component needs tests BEFORE implementation
- Test files go next to source: `Component.test.tsx`
- Minimum coverage: render, user interactions, accessibility, error states
- Use Vitest + React Testing Library for React components
- Run `npm test` or `pnpm test` after each change

### Test Patterns

```typescript
// Example: Component render test
test('renders channel card with title', () => {
  render(<ChannelCard title="Algorithms" questionCount={50} />);
  expect(screen.getByText('Algorithms')).toBeInTheDocument();
  expect(screen.getByText('50 questions')).toBeInTheDocument();
});

// Example: Interaction test
test('card navigates on click', async () => {
  const onNavigate = jest.fn();
  render(<ChannelCard onClick={onNavigate} />);
  await userEvent.click(screen.getByRole('button'));
  expect(onNavigate).toHaveBeenCalled();
});

// Example: Accessibility test
test('card is keyboard accessible', async () => {
  render(<ChannelCard />);
  const card = screen.getByRole('article');
  card.focus();
  expect(card).toHaveFocus();
});
```

## Design Thinking

Before coding, understand the context and commit to a BOLD aesthetic direction:
- **Purpose**: What problem does this interface solve? Who uses it?
- **Tone**: Pick an extreme: brutally minimal, maximalist chaos, retro-futuristic, organic/natural, luxury/refined, playful/toy-like, editorial/magazine, brutalist/raw, art deco/geometric, soft/pastel, industrial/utilitarian, etc. There are so many flavors to choose from. Use these for inspiration but design one that is true to the aesthetic direction.
- **Constraints**: Technical requirements (framework, performance, accessibility).
- **Differentiation**: What makes this UNFORGETTABLE? What's the one thing someone will remember?

**CRITICAL**: Choose a clear conceptual direction and execute it with precision. Bold maximalism and refined minimalism both work - the key is intentionality, not intensity.

Then implement working code (HTML/CSS/JS, React, Vue, etc.) that is:
- Production-grade and functional
- Visually striking and memorable
- Cohesive with a clear aesthetic point-of-view
- Meticulously refined in every detail

## Frontend Aesthetics Guidelines

Focus on:
- **Typography**: Choose fonts that are beautiful, unique, and interesting. Avoid generic fonts like Arial and Inter; opt instead for distinctive choices that elevate the frontend's aesthetics; unexpected, characterful font choices. Pair a distinctive display font with a refined body font.
- **Color & Theme**: Commit to a cohesive aesthetic. Use CSS variables for consistency. Dominant colors with sharp accents outperform timid, evenly-distributed palettes.
- **Motion**: Use animations for effects and micro-interactions. Prioritize CSS-only solutions for HTML. Use Motion library for React when available. Focus on high-impact moments: one well-orchestrated page load with staggered reveals (animation-delay) creates more delight than scattered micro-interactions. Use scroll-triggering and hover states that surprise.
- **Spatial Composition**: Unexpected layouts. Asymmetry. Overlap. Diagonal flow. Grid-breaking elements. Generous negative space OR controlled density.
- **Backgrounds & Visual Details**: Create atmosphere and depth rather than defaulting to solid colors. Add contextual effects and textures that match the overall aesthetic. Apply creative forms like gradient meshes, noise textures, geometric patterns, layered transparencies, dramatic shadows, decorative borders, custom cursors, and grain overlays.

NEVER use generic AI-generated aesthetics like overused font families (Inter, Roboto, Arial, system fonts), cliched color schemes (particularly purple gradients on white backgrounds), predictable layouts and component patterns, and cookie-cutter design that lacks context-specific character.

Interpret creatively and make unexpected choices that feel genuinely designed for the context. No design should be the same. Vary between light and dark themes, different fonts, different aesthetics. NEVER converge on common choices (Space Grotesk, for example) across generations.

**IMPORTANT**: Match implementation complexity to the aesthetic vision. Maximalist designs need elaborate code with extensive animations and effects. Minimalist or refined designs need restraint, precision, and careful attention to spacing, typography, and subtle details. Elegance comes from executing the vision well.

Remember: Claude is capable of extraordinary creative work. Don't hold back, show what can truly be created when thinking outside the box and committing fully to a distinctive vision.
