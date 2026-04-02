/**
 * DevPrep Tailwind CSS Configuration
 * 
 * This config maps Tailwind utilities to GitHub Design System CSS variables.
 * All colors follow GitHub Primer tokens for consistency with the design system.
 * 
 * @see https://primer.style/css/support/color-system
 * @see https://tailwindcss.com/docs/configuration
 */

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // GitHub Canvas (backgrounds)
        'gh-canvas': 'var(--gh-canvas)',
        'gh-canvas-subtle': 'var(--gh-canvas-subtle)',
        'gh-canvas-inset': 'var(--gh-canvas-inset)',
        'gh-canvas-overlay': 'var(--gh-canvas-overlay)',
        
        // GitHub Foreground (text)
        'gh-fg': 'var(--gh-fg)',
        'gh-fg-muted': 'var(--gh-fg-muted)',
        'gh-fg-subtle': 'var(--gh-fg-subtle)',
        'gh-fg-on-emphasis': 'var(--gh-fg-on-emphasis)',
        
        // GitHub Borders
        'gh-border': 'var(--gh-border)',
        'gh-border-muted': 'var(--gh-border-muted)',
        
        // GitHub Accent (blue)
        'gh-accent': 'var(--gh-accent-fg)',
        'gh-accent-emphasis': 'var(--gh-accent-emphasis)',
        'gh-accent-subtle': 'var(--gh-accent-subtle)',
        'gh-accent-hover': 'var(--gh-accent-hover)',
        
        // GitHub Success (green)
        'gh-success': 'var(--gh-success-fg)',
        'gh-success-emphasis': 'var(--gh-success-emphasis)',
        'gh-success-subtle': 'var(--gh-success-subtle)',
        'gh-success-hover': 'var(--gh-success-hover)',
        
        // GitHub Attention (yellow/orange)
        'gh-attention': 'var(--gh-attention-fg)',
        'gh-attention-emphasis': 'var(--gh-attention-emphasis)',
        'gh-attention-subtle': 'var(--gh-attention-subtle)',
        'gh-attention-hover': 'var(--gh-attention-hover)',
        
        // GitHub Danger (red)
        'gh-danger': 'var(--gh-danger-fg)',
        'gh-danger-emphasis': 'var(--gh-danger-emphasis)',
        'gh-danger-subtle': 'var(--gh-danger-subtle)',
        'gh-danger-hover': 'var(--gh-danger-hover)',
        
        // GitHub Done (purple)
        'gh-done': 'var(--gh-done-fg)',
        'gh-done-emphasis': 'var(--gh-done-emphasis)',
        'gh-done-subtle': 'var(--gh-done-subtle)',
        'gh-done-hover': 'var(--gh-done-hover)',
        
        // GitHub Neutral
        'gh-neutral': 'var(--gh-neutral-emphasis)',
        'gh-neutral-subtle': 'var(--gh-neutral-subtle)',
        'gh-neutral-muted': 'var(--gh-neutral-muted)',
        
        // GitHub Pink (for gradients)
        'gh-pink': 'var(--gh-pink-fg)',
        'gh-pink-emphasis': 'var(--gh-pink-emphasis)',
        
        // Difficulty badges
        'gh-diff-beginner': 'var(--gh-diff-beginner)',
        'gh-diff-beginner-bg': 'var(--gh-diff-beginner-bg)',
        'gh-diff-intermediate': 'var(--gh-diff-intermediate)',
        'gh-diff-intermediate-bg': 'var(--gh-diff-intermediate-bg)',
        'gh-diff-advanced': 'var(--gh-diff-advanced)',
        'gh-diff-advanced-bg': 'var(--gh-diff-advanced-bg)',
        
        // Legacy aliases (for backward compatibility)
        'primary': 'var(--primary)',
        'secondary': 'var(--secondary)',
        'muted': 'var(--muted)',
        'muted-foreground': 'var(--muted-foreground)',
        'accent': 'var(--accent)',
        'destructive': 'var(--destructive)',
        'border': 'var(--border)',
        'input': 'var(--input)',
        'ring': 'var(--ring)',
        'success': 'var(--success)',
      },
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        'mono': ['JetBrains Mono', 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', 'monospace'],
        'display': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      borderRadius: {
        'radius-sm': 'var(--gh-radius-sm, 4px)',
        'radius-md': 'var(--gh-radius-md, 6px)',
        'radius-lg': 'var(--gh-radius-lg, 8px)',
        'radius-xl': 'var(--gh-radius-xl, 12px)',
      },
      boxShadow: {
        'gh-xs': 'var(--gh-shadow-xs)',
        'gh-sm': 'var(--gh-shadow-sm)',
        'gh-md': 'var(--gh-shadow-md)',
        'gh-lg': 'var(--gh-shadow-lg)',
        'gh-xl': 'var(--gh-shadow-xl)',
        'glow-accent': '0 0 20px var(--gh-focus-ring)',
        'glow-success': '0 0 20px var(--gh-success-subtle)',
        'glow-danger': '0 0 20px var(--gh-danger-subtle)',
      },
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-in': 'slideIn 200ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      transitionTimingFunction: {
        'gh-in': 'var(--gh-ease-in)',
        'gh-out': 'var(--gh-ease-out)',
        'gh-in-out': 'var(--gh-ease-in-out)',
      },
      transitionDuration: {
        'gh-fast': 'var(--gh-duration-fast)',
        'gh-normal': 'var(--gh-duration-normal)',
        'gh-slow': 'var(--gh-duration-slow)',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
}
