/**
 * Design Tokens - Spacing
 * 8px base unit with consistent scale
 */

export const spacing = {
  // Base unit
  base: 8,

  // Spacing scale (multiples of 8)
  scale: {
    0: '0',
    0.5: '0.125rem',   // 2px
    1: '0.25rem',      // 4px
    1.5: '0.375rem',   // 6px
    2: '0.5rem',       // 8px
    2.5: '0.625rem',   // 10px
    3: '0.75rem',      // 12px
    3.5: '0.875rem',   // 14px
    4: '1rem',         // 16px
    5: '1.25rem',      // 20px
    6: '1.5rem',       // 24px
    7: '1.75rem',      // 28px
    8: '2rem',         // 32px
    9: '2.25rem',      // 36px
    10: '2.5rem',      // 40px
    11: '2.75rem',     // 44px
    12: '3rem',        // 48px
    14: '3.5rem',      // 56px
    16: '4rem',        // 64px
    20: '5rem',        // 80px
    24: '6rem',        // 96px
    28: '7rem',        // 112px
    32: '8rem',        // 128px
    36: '9rem',        // 144px
    40: '10rem',       // 160px
    44: '11rem',       // 176px
    48: '12rem',       // 192px
    52: '13rem',       // 208px
    56: '14rem',       // 224px
    60: '15rem',       // 240px
    64: '16rem',       // 256px
    72: '18rem',       // 288px
    80: '20rem',       // 320px
    96: '24rem',       // 384px
  },

  // Semantic spacing
  semantic: {
    // Component padding
    component: {
      xs: '0.25rem',   // 4px
      sm: '0.5rem',    // 8px
      md: '1rem',      // 16px
      lg: '1.5rem',    // 24px
      xl: '2rem',      // 32px
    },

    // Layout spacing
    layout: {
      gutter: '1.5rem',     // 24px
      section: '3rem',      // 48px
      page: '2rem',         // 32px
      container: '1rem',    // 16px
    },

    // Card spacing
    card: {
      padding: '1.5rem',    // 24px
      gap: '1rem',          // 16px
      header: '1rem',       // 16px
      body: '1.5rem',       // 24px
      footer: '1rem',       // 16px
    },

    // Form spacing
    form: {
      fieldGap: '1.5rem',   // 24px
      labelGap: '0.5rem',   // 8px
      inputPadding: '0.75rem', // 12px
      buttonGap: '0.75rem', // 12px
    },

    // Navigation spacing
    navigation: {
      itemGap: '0.5rem',    // 8px
      sectionGap: '2rem',   // 32px
      menuPadding: '1rem',  // 16px
    },
  },

  // Touch targets (accessibility)
  touchTarget: {
    minimum: '44px',        // WCAG minimum
    comfortable: '48px',    // Comfortable size
    large: '56px',          // Large touch target
  },

  // Breakpoints
  breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Container widths
  container: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Z-index scale
  zIndex: {
    hide: -1,
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    toast: 1600,
    tooltip: 1700,
  },
};

export default spacing;