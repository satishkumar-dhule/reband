/**
 * Design Tokens - Animations
 * Consistent timing functions and durations
 */

export const animations = {
  // Duration scale (in milliseconds)
  duration: {
    instant: 0,
    fast: 100,
    normal: 200,
    slow: 300,
    slower: 500,
    slowest: 1000,
  },

  // Easing functions
  easing: {
    // Standard easing
    ease: 'ease',
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',

    // Custom easing curves
    easeInCubic: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
    easeOutCubic: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
    easeInOutCubic: 'cubic-bezier(0.645, 0.045, 0.355, 1)',
    easeInBack: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
    easeOutBack: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    easeInOutBack: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    easeInElastic: 'cubic-bezier(0.5, 0, 0.75, 0)',
    easeOutElastic: 'cubic-bezier(0.5, 1, 0.75, 1)',
    easeInOutElastic: 'cubic-bezier(0.5, -0.25, 0.75, 1.25)',

    // Spring animations
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    springStiff: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Animation presets
  presets: {
    // Fade animations
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
      duration: 200,
      easing: 'ease-out',
    },
    fadeOut: {
      from: { opacity: 1 },
      to: { opacity: 0 },
      duration: 150,
      easing: 'ease-in',
    },

    // Slide animations
    slideInUp: {
      from: { transform: 'translateY(20px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
      duration: 300,
      easing: 'ease-out',
    },
    slideInDown: {
      from: { transform: 'translateY(-20px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
      duration: 300,
      easing: 'ease-out',
    },
    slideInLeft: {
      from: { transform: 'translateX(-20px)', opacity: 0 },
      to: { transform: 'translateX(0)', opacity: 1 },
      duration: 300,
      easing: 'ease-out',
    },
    slideInRight: {
      from: { transform: 'translateX(20px)', opacity: 0 },
      to: { transform: 'translateX(0)', opacity: 1 },
      duration: 300,
      easing: 'ease-out',
    },

    // Scale animations
    scaleIn: {
      from: { transform: 'scale(0.9)', opacity: 0 },
      to: { transform: 'scale(1)', opacity: 1 },
      duration: 200,
      easing: 'ease-out',
    },
    scaleOut: {
      from: { transform: 'scale(1)', opacity: 1 },
      to: { transform: 'scale(0.9)', opacity: 0 },
      duration: 150,
      easing: 'ease-in',
    },

    // Bounce animations
    bounceIn: {
      from: { transform: 'scale(0.3)', opacity: 0 },
      to: { transform: 'scale(1)', opacity: 1 },
      duration: 500,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },

    // Flip animations
    flipX: {
      from: { transform: 'perspective(400px) rotateX(90deg)', opacity: 0 },
      to: { transform: 'perspective(400px) rotateX(0)', opacity: 1 },
      duration: 400,
      easing: 'ease-out',
    },
    flipY: {
      from: { transform: 'perspective(400px) rotateY(90deg)', opacity: 0 },
      to: { transform: 'perspective(400px) rotateY(0)', opacity: 1 },
      duration: 400,
      easing: 'ease-out',
    },
  },

  // Transition presets
  transitions: {
    // Color transitions
    color: {
      property: 'color, background-color, border-color',
      duration: 150,
      easing: 'ease-in-out',
    },

    // Transform transitions
    transform: {
      property: 'transform',
      duration: 200,
      easing: 'ease-out',
    },

    // Opacity transitions
    opacity: {
      property: 'opacity',
      duration: 150,
      easing: 'ease-in-out',
    },

    // Shadow transitions
    shadow: {
      property: 'box-shadow',
      duration: 200,
      easing: 'ease-out',
    },

    // All transitions
    all: {
      property: 'all',
      duration: 200,
      easing: 'ease-in-out',
    },

    // None (immediate)
    none: {
      property: 'none',
      duration: 0,
      easing: 'linear',
    },
  },

  // Keyframe animations
  keyframes: {
    spin: {
      from: { transform: 'rotate(0deg)' },
      to: { transform: 'rotate(360deg)' },
    },
    pulse: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.5 },
    },
    bounce: {
      '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
      '40%': { transform: 'translateY(-10px)' },
      '60%': { transform: 'translateY(-5px)' },
    },
    shake: {
      '0%, 100%': { transform: 'translateX(0)' },
      '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
      '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
    },
    progress: {
      '0%': { backgroundPosition: '200% 0' },
      '100%': { backgroundPosition: '-200% 0' },
    },
    glow: {
      '0%, 100%': { boxShadow: '0 0 5px rgba(255, 255, 255, 0.5)' },
      '50%': { boxShadow: '0 0 20px rgba(255, 255, 255, 0.8)' },
    },
  },

  // GPU acceleration utilities
  gpu: {
    willChange: {
      transform: 'transform',
      opacity: 'opacity',
      scroll: 'scroll-position',
      auto: 'auto',
    },
    backfaceVisibility: {
      hidden: 'hidden',
      visible: 'visible',
    },
    transformStyle: {
      flat: 'flat',
      preserve3d: 'preserve-3d',
    },
  },
};

export default animations;