/**
 * Design System Atoms
 * 
 * Basic building blocks of the DevPrep design system.
 * Each atom is a primitive UI component with specific responsibilities.
 */

// Button component
export { default as Button } from './Button';
export type { 
  ButtonProps, 
  ButtonVariant, 
  ButtonSize, 
  RatingType, 
  ButtonState 
} from './Button';

// Text component
export { default as Text } from './Text';
export type { 
  TextProps, 
  TextVariant, 
  TextColor 
} from './Text';

// Icon component
export { default as Icon } from './Icon';
export type { 
  IconProps, 
  IconSize, 
  IconColor 
} from './Icon';

// Badge component
export { default as Badge } from './Badge';
export type { 
  BadgeProps, 
  BadgeType, 
  BadgeSize, 
  MasteryLevel 
} from './Badge';

// Re-export all atoms as a collection
export const atoms = {
  Button: () => import('./Button'),
  Text: () => import('./Text'),
  Icon: () => import('./Icon'),
  Badge: () => import('./Badge'),
};

export default atoms;