/**
 * Design Tokens Index
 * Central export for all design tokens
 */

export { colors, darkColors } from './colors';
export { typography } from './typography';
export { spacing } from './spacing';
export { animations } from './animations';

// Re-export as default tokens object
import { colors, darkColors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { animations } from './animations';

export const tokens = {
  colors,
  darkColors,
  typography,
  spacing,
  animations,
};

export default tokens;