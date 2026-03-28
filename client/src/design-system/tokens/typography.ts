/**
 * Design Tokens - Typography
 * Modular scale with 1.25 ratio for consistent hierarchy
 */

export const typography = {
  // Font families
  fontFamily: {
    primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"JetBrains Mono", "Fira Code", "Consolas", "Monaco", monospace',
    display: '"Inter", sans-serif',
  },

  // Font weights
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Font sizes (modular scale 1.25)
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    md: '1.125rem',   // 18px
    lg: '1.25rem',    // 20px
    xl: '1.5rem',     // 24px
    '2xl': '1.875rem', // 30px
    '3xl': '2.25rem',  // 36px
    '4xl': '3rem',     // 48px
    '5xl': '3.75rem',  // 60px
    '6xl': '4.5rem',   // 72px
  },

  // Line heights
  lineHeight: {
    none: 1,
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Letter spacing
  letterSpacing: {
    tighter: '-0.05em',
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
    wider: '0.05em',
    widest: '0.1em',
  },

  // Text styles
  textStyles: {
    // Headings
    h1: {
      fontSize: '3rem',
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: '-0.025em',
      fontFamily: '"Inter", sans-serif',
    },
    h2: {
      fontSize: '2.25rem',
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: '-0.025em',
      fontFamily: '"Inter", sans-serif',
    },
    h3: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.375,
      letterSpacing: '-0.025em',
      fontFamily: '"Inter", sans-serif',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.375,
      letterSpacing: '-0.025em',
      fontFamily: '"Inter", sans-serif',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '0',
      fontFamily: '"Inter", sans-serif',
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '0',
      fontFamily: '"Inter", sans-serif',
    },

    // Body text
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0',
      fontFamily: '"Inter", sans-serif',
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0',
      fontFamily: '"Inter", sans-serif',
    },

    // Caption and small text
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0',
      fontFamily: '"Inter", sans-serif',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '0.05em',
      textTransform: 'uppercase',
      fontFamily: '"Inter", sans-serif',
    },

    // Code
    code: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0',
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    },
    pre: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0',
      fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    },

    // Buttons
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '0.025em',
      textTransform: 'uppercase',
      fontFamily: '"Inter", sans-serif',
    },

    // Labels
    label: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0',
      fontFamily: '"Inter", sans-serif',
    },
  },

  // Responsive font sizes
  responsive: {
    mobile: {
      h1: '2rem',
      h2: '1.75rem',
      h3: '1.5rem',
      h4: '1.25rem',
      h5: '1.125rem',
      h6: '1rem',
      body1: '1rem',
      body2: '0.875rem',
    },
    tablet: {
      h1: '2.5rem',
      h2: '2rem',
      h3: '1.75rem',
      h4: '1.5rem',
      h5: '1.25rem',
      h6: '1.125rem',
      body1: '1rem',
      body2: '0.875rem',
    },
    desktop: {
      h1: '3rem',
      h2: '2.25rem',
      h3: '1.875rem',
      h4: '1.5rem',
      h5: '1.25rem',
      h6: '1.125rem',
      body1: '1rem',
      body2: '0.875rem',
    },
  },
};

export default typography;