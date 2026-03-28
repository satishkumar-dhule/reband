/**
 * Design Tokens - Colors
 * GitHub (Primer) inspired color palette with semantic naming
 */

// Primary palette (GitHub Blue)
export const colors = {
  // Primary brand colors
  primary: {
    50: '#ddf4ff',
    100: '#b6e3ff',
    200: '#80ccff',
    300: '#54aeff',
    400: '#218bff',
    500: '#0969da',
    600: '#0550ae',
    700: '#033d8b',
    800: '#0a3069',
    900: '#002244',
    contrastText: '#FFFFFF',
  },

  // Secondary brand colors (GitHub Purple - for accents/secondary actions)
  secondary: {
    50: '#fbefff',
    100: '#f0d7ff',
    200: '#e2c4ff',
    300: '#d2a8ff',
    400: '#bc8cff',
    500: '#8250df',
    600: '#6639ba',
    700: '#512ea4',
    800: '#3b1f82',
    900: '#2a1462',
    contrastText: '#FFFFFF',
  },

  // Semantic colors (GitHub semantic colors)
  semantic: {
    success: {
      light: '#aff5b4',
      main: '#2da44e',
      dark: '#1a7f37',
      contrastText: '#FFFFFF',
    },
    warning: {
      light: '#fff8c5',
      main: '#d29922',
      dark: '#9a6700',
      contrastText: '#24292f',
    },
    error: {
      light: '#ffebe9',
      main: '#cf222e',
      dark: '#a40e26',
      contrastText: '#FFFFFF',
    },
    info: {
      light: '#ddf4ff',
      main: '#0969da',
      dark: '#0550ae',
      contrastText: '#FFFFFF',
    },
  },

  // Neutral colors (GitHub grays)
  neutral: {
    0: '#ffffff',
    50: '#f6f8fa',
    100: '#eaeef2',
    200: '#d0d7de',
    300: '#afb8c1',
    400: '#8c959f',
    500: '#6e7781',
    600: '#57606a',
    700: '#424a53',
    800: '#32383f',
    900: '#24292f',
    1000: '#000000',
  },

  // Background colors
  background: {
    default: '#f6f8fa',
    paper: '#ffffff',
    dark: '#0d1117',
    card: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Text colors
  text: {
    primary: '#24292f',
    secondary: '#57606a',
    disabled: '#8c959f',
    hint: '#8c959f',
    inverse: '#ffffff',
  },

  // SRS-specific colors (adapted to GitHub palette)
  srs: {
    again: '#cf222e', // GitHub red for "Again"
    hard: '#d29922',  // GitHub yellow for "Hard"
    good: '#2da44e',  // GitHub green for "Good"
    easy: '#0969da',  // GitHub blue for "Easy"
    mastery: {
      0: '#6e7781', // New/Unknown (neutral)
      1: '#cf222e', // Learning (red)
      2: '#d29922', // Familiar (yellow)
      3: '#fb8500', // Known (orange)
      4: '#2da44e', // Mastered (green)
      5: '#1a7f37', // Expert (dark green)
    },
  },

  // Status colors
  status: {
    online: '#2da44e',
    offline: '#6e7781',
    away: '#d29922',
    busy: '#cf222e',
  },
};

// Dark mode colors (GitHub dark theme)
export const darkColors = {
  ...colors,
  background: {
    default: '#0d1117',
    paper: '#161b22',
    dark: '#010409',
    card: '#161b22',
    overlay: 'rgba(1, 4, 9, 0.8)',
  },
  text: {
    primary: '#e6edf3',
    secondary: '#8b949e',
    disabled: '#484f58',
    hint: '#484f58',
    inverse: '#0d1117',
  },
  neutral: {
    ...colors.neutral,
    0: '#0d1117',
    50: '#161b22',
    100: '#21262d',
    200: '#30363d',
    300: '#484f58',
    400: '#6e7681',
    500: '#8b949e',
    600: '#c9d1d9',
    700: '#e6edf3',
    800: '#e6edf3',
    900: '#f0f6fc',
    1000: '#ffffff',
  },
  primary: {
    ...colors.primary,
    50: '#1f6feb', // Interactive blue for dark mode
  },
  secondary: {
    ...colors.secondary,
    50: '#a371f7', // Lighter purple for dark mode
  },
  semantic: {
    success: {
      light: '#1a7f37',
      main: '#3fb950',
      dark: '#238636',
      contrastText: '#FFFFFF',
    },
    warning: {
      light: '#7c4a00',
      main: '#d29922',
      dark: '#e3b341',
      contrastText: '#24292f',
    },
    error: {
      light: '#a40e26',
      main: '#f85149',
      dark: '#da3633',
      contrastText: '#FFFFFF',
    },
    info: {
      light: '#1f6feb',
      main: '#58a6ff',
      dark: '#0550ae',
      contrastText: '#FFFFFF',
    },
  },
};

export default colors;