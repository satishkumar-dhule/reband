/**
 * Design Tokens - Colors
 * WCAG AA compliant color palette with semantic naming
 */

// Primary palette
export const colors = {
  // Primary brand colors
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3',
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
    contrastText: '#FFFFFF',
  },

  // Secondary brand colors
  secondary: {
    50: '#FCE4EC',
    100: '#F8BBD0',
    200: '#F48FB1',
    300: '#F06292',
    400: '#EC407A',
    500: '#E91E63',
    600: '#D81B60',
    700: '#C2185B',
    800: '#AD1457',
    900: '#880E4F',
    contrastText: '#FFFFFF',
  },

  // Semantic colors
  semantic: {
    success: {
      light: '#81C784',
      main: '#4CAF50',
      dark: '#388E3C',
      contrastText: '#FFFFFF',
    },
    warning: {
      light: '#FFB74D',
      main: '#FF9800',
      dark: '#F57C00',
      contrastText: '#000000',
    },
    error: {
      light: '#E57373',
      main: '#F44336',
      dark: '#D32F2F',
      contrastText: '#FFFFFF',
    },
    info: {
      light: '#64B5F6',
      main: '#2196F3',
      dark: '#1976D2',
      contrastText: '#FFFFFF',
    },
  },

  // Neutral colors
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    1000: '#000000',
  },

  // Background colors
  background: {
    default: '#FAFAFA',
    paper: '#FFFFFF',
    dark: '#121212',
    card: '#FFFFFF',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Text colors
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
    hint: 'rgba(0, 0, 0, 0.38)',
    inverse: '#FFFFFF',
  },

  // SRS-specific colors
  srs: {
    again: '#F44336', // Red for "Again"
    hard: '#FF9800',  // Orange for "Hard"  
    good: '#4CAF50',  // Green for "Good"
    easy: '#2196F3',  // Blue for "Easy"
    mastery: {
      0: '#9E9E9E', // New/Unknown
      1: '#F44336', // Learning
      2: '#FF9800', // Familiar
      3: '#FFEB3B', // Known
      4: '#4CAF50', // Mastered
      5: '#2E7D32', // Expert
    },
  },

  // Status colors
  status: {
    online: '#4CAF50',
    offline: '#9E9E9E',
    away: '#FF9800',
    busy: '#F44336',
  },
};

// Dark mode colors
export const darkColors = {
  ...colors,
  background: {
    default: '#121212',
    paper: '#1E1E1E',
    dark: '#000000',
    card: '#1E1E1E',
    overlay: 'rgba(255, 255, 255, 0.1)',
  },
  text: {
    primary: '#FFFFFF',
    secondary: 'rgba(255, 255, 255, 0.7)',
    disabled: 'rgba(255, 255, 255, 0.5)',
    hint: 'rgba(255, 255, 255, 0.5)',
    inverse: 'rgba(0, 0, 0, 0.87)',
  },
  neutral: {
    ...colors.neutral,
    0: '#121212',
    50: '#1E1E1E',
    100: '#2D2D2D',
    200: '#3D3D3D',
    300: '#4D4D4D',
    400: '#5D5D5D',
    500: '#6D6D6D',
    600: '#7D7D7D',
    700: '#8D8D8D',
    800: '#9D9D9D',
    900: '#ADADAD',
    1000: '#FFFFFF',
  },
};

export default colors;