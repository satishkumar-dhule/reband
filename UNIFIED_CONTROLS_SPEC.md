# Unified Control Specification

## Overview
This document defines the standard controls that ALL pages and components MUST use for consistency.

## Core Principles
1. Use unified components from `@/components/unified/` when available
2. Use shadcn/ui components from `@/components/ui/` for form controls
3. All colors MUST use GitHub CSS variables (`--gh-*`)
4. All spacing MUST use Tailwind spacing scale

## Standard Control Imports

```typescript
// BUTTONS - Use unified/Button.tsx
import { Button, IconButton, ButtonGroup } from '@/components/unified/Button';

// INPUTS - Use ui/input.tsx
import { Input } from '@/components/ui/input';

// TEXTAREA - Use ui/textarea.tsx
import { Textarea } from '@/components/ui/textarea';

// SELECT - Use ui/select.tsx
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';

// CHECKBOX - Use ui/checkbox.tsx
import { Checkbox } from '@/components/ui/checkbox';

// SWITCH - Use ui/switch.tsx
import { Switch } from '@/components/ui/switch';

// RADIO - Use ui/radio-group.tsx
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// TABS - Use ui/tabs.tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// DIALOG - Use ui/dialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

// DROPDOWN - Use ui/dropdown-menu.tsx
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';

// FORM - Use ui/form.tsx with react-hook-form
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
```

## Accessibility & QA Best Practices
- All interactive controls MUST have keyboard-accessible focus and visible focus rings.
- All form controls MUST be associated with a label via htmlFor/id or aria-label when labeling visually is not feasible.
- Use semantic HTML elements where possible (button, input, select, textarea, etc.). Avoid divs with role="button" for interactive elements.
- Ensure color contrast meets WCAG 2.1 AA; avoid relying on color alone to convey meaning.
- All modal/dialog components SHALL trap focus while open and return focus to the initiating control when closed.
- Provide ARIA roles and properties for dynamic content updates (aria-live where appropriate).
- For components that dynamically render states (loading, error, success), provide explicit ARIA attributes and screen-reader text equivalents.
- All components exposed as part of the public API MUST include accessible tests in the QA suite.

## Button Usage Standards

```tsx
// Primary actions
<Button variant="primary" size="md">Submit</Button>

// Secondary actions
<Button variant="secondary" size="md">Cancel</Button>

// Outline buttons
<Button variant="outline" size="md">Learn More</Button>

// Ghost buttons (minimal emphasis)
<Button variant="ghost" size="md">Dismiss</Button>

// Danger actions
<Button variant="danger" size="md">Delete</Button>

// Success actions
<Button variant="success" size="md">Confirm</Button>

// Icon buttons
<IconButton icon={<X />} aria-label="Close" size="sm" />

// Loading state
<Button loading>Processing...</Button>
```

## Form Control Standards

```tsx
// Input with label
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="you@example.com" />
</div>

// Input with error
<Input isInvalid error="Invalid email format" />

// Textarea with count
<Textarea 
  label="Description"
  placeholder="Enter description..."
  maxLength={500}
  showCount
/>

// Select
<Select onValueChange={handleChange}>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="1">Option 1</SelectItem>
    <SelectItem value="2">Option 2</SelectItem>
  </SelectContent>
</Select>

// Checkbox
<div className="flex items-center space-x-2">
  <Checkbox id="terms" />
  <Label htmlFor="terms">Accept terms</Label>
</div>

// Switch
<div className="flex items-center space-x-2">
  <Switch id="notifications" />
  <Label htmlFor="notifications">Enable notifications</Label>
</div>
```

## Color Tokens (GitHub CSS Variables)

| Token | Usage |
|-------|-------|
| `--gh-fg` | Primary text |
| `--gh-fg-muted` | Secondary/muted text |
| `--gh-bg` | Canvas background |
| `--gh-border` | Default border |
| `--gh-accent-emphasis` | Accent color (buttons, links) |
| `--gh-accent-fg` | Accent foreground |
| `--gh-accent-subtle` | Accent background |
| `--gh-danger-fg` | Error text |
| `--gh-danger-emphasis` | Error background |
| `--gh-focus-ring` | Focus ring |
| `--gh-canvas` | Card background |

## Spacing Standards

- **xs**: 2px (0.125rem) - Tight spacing
- **sm**: 4px (0.25rem) - Compact elements
- **md**: 8px (0.5rem) - Default spacing
- **lg**: 16px (1rem) - Section spacing
- **xl**: 24px (1.5rem) - Major sections
- **2xl**: 32px (2rem) - Page sections

## Common Patterns

### Card with actions
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
  <CardFooter className="flex justify-end gap-2">
    <Button variant="ghost">Cancel</Button>
    <Button variant="primary">Submit</Button>
  </CardFooter>
</Card>
```

### Form layout
```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Email</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <Button type="submit">Submit</Button>
  </form>
</Form>
```

## Prohibited Patterns

❌ DO NOT use inline `bg-blue-500` or hardcoded colors
❌ DO NOT use `px-5` or custom padding values
❌ DO NOT mix `Button` from `ui/` with `Button` from `unified/`
❌ DO NOT create custom button styles
❌ DO NOT use `<button>` directly without using the unified Button component
❌ DO NOT hardcode border colors like `border-gray-300`

✅ DO use GitHub CSS variables (`--gh-*`)
✅ DO use Tailwind spacing scale
✅ DO use unified Button component
✅ DO use shadcn/ui form controls
