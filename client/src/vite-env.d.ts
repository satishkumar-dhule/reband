/// <reference types="vite/client" />

interface DOMPurify {
  sanitize(dirty: string, config?: { USE_PROFILES?: { svg?: boolean } }): string;
}
declare const DOMPurify: DOMPurify | undefined;

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  import React from 'react';
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.ico' {
  const src: string;
  export default src;
}

declare module '*.woff' {
  const src: string;
  export default src;
}

declare module '*.woff2' {
  const src: string;
  export default src;
}

declare module '*.ttf' {
  const src: string;
  export default src;
}

declare module '*.otf' {
  const src: string;
  export default src;
}

declare module '*.mp4' {
  const src: string;
  export default src;
}

declare module '*.webm' {
  const src: string;
  export default src;
}

declare module '*.ogg' {
  const src: string;
  export default src;
}

declare module '*.mp3' {
  const src: string;
  export default src;
}

declare module '*.wav' {
  const src: string;
  export default src;
}

declare module '*.md' {
  const content: string;
  export default content;
}

declare module '*.json' {
  const content: any;
  export default content;
}

declare module 'mermaid/dist/mermaid.esm.mjs' {
  const mermaid: {
    initialize: (config: Record<string, unknown>) => void;
    run: (config: { nodes: HTMLElement[] }) => Promise<void>;
    render: (id: string, text: string) => Promise<{ svg: string }>;
    contentLoaded: () => void;
    parse: (text: string) => Promise<boolean>;
  };
  export default mermaid;
}

// react-syntax-highlighter Prism theme modules
declare module 'react-syntax-highlighter/dist/esm/styles/prism/a11y-one-light' {
  import type { Theme as PrismTheme } from 'react-syntax-highlighter';
  const theme: PrismTheme;
  export default theme;
}

// Global CSS custom properties
declare namespace CSS {
  interface Property {
    '--color-primary-50'?: string;
    '--color-primary-100'?: string;
    '--color-primary-200'?: string;
    '--color-primary-300'?: string;
    '--color-primary-400'?: string;
    '--color-primary-500'?: string;
    '--color-primary-600'?: string;
    '--color-primary-700'?: string;
    '--color-primary-800'?: string;
    '--color-primary-900'?: string;
    '--color-primary-contrastText'?: string;
    
    '--color-secondary-50'?: string;
    '--color-secondary-100'?: string;
    '--color-secondary-200'?: string;
    '--color-secondary-300'?: string;
    '--color-secondary-400'?: string;
    '--color-secondary-500'?: string;
    '--color-secondary-600'?: string;
    '--color-secondary-700'?: string;
    '--color-secondary-800'?: string;
    '--color-secondary-900'?: string;
    '--color-secondary-contrastText'?: string;
    
    '--color-semantic-success-light'?: string;
    '--color-semantic-success-main'?: string;
    '--color-semantic-success-dark'?: string;
    '--color-semantic-success-contrastText'?: string;
    
    '--color-semantic-warning-light'?: string;
    '--color-semantic-warning-main'?: string;
    '--color-semantic-warning-dark'?: string;
    '--color-semantic-warning-contrastText'?: string;
    
    '--color-semantic-error-light'?: string;
    '--color-semantic-error-main'?: string;
    '--color-semantic-error-dark'?: string;
    '--color-semantic-error-contrastText'?: string;
    
    '--color-semantic-info-light'?: string;
    '--color-semantic-info-main'?: string;
    '--color-semantic-info-dark'?: string;
    '--color-semantic-info-contrastText'?: string;
    
    '--color-neutral-0'?: string;
    '--color-neutral-50'?: string;
    '--color-neutral-100'?: string;
    '--color-neutral-200'?: string;
    '--color-neutral-300'?: string;
    '--color-neutral-400'?: string;
    '--color-neutral-500'?: string;
    '--color-neutral-600'?: string;
    '--color-neutral-700'?: string;
    '--color-neutral-800'?: string;
    '--color-neutral-900'?: string;
    '--color-neutral-1000'?: string;
    
    '--color-background-default'?: string;
    '--color-background-paper'?: string;
    '--color-background-dark'?: string;
    '--color-background-card'?: string;
    '--color-background-overlay'?: string;
    
    '--color-text-primary'?: string;
    '--color-text-secondary'?: string;
    '--color-text-disabled'?: string;
    '--color-text-hint'?: string;
    '--color-text-inverse'?: string;
    
    '--color-srs-again'?: string;
    '--color-srs-hard'?: string;
    '--color-srs-good'?: string;
    '--color-srs-easy'?: string;
    '--color-srs-mastery-0'?: string;
    '--color-srs-mastery-1'?: string;
    '--color-srs-mastery-2'?: string;
    '--color-srs-mastery-3'?: string;
    '--color-srs-mastery-4'?: string;
    '--color-srs-mastery-5'?: string;
    
    '--color-status-online'?: string;
    '--color-status-offline'?: string;
    '--color-status-away'?: string;
    '--color-status-busy'?: string;
    
    '--font-family-primary'?: string;
    '--font-family-mono'?: string;
    '--font-family-display'?: string;
    
    '--font-weight-light'?: string;
    '--font-weight-regular'?: string;
    '--font-weight-medium'?: string;
    '--font-weight-semibold'?: string;
    '--font-weight-bold'?: string;
    
    '--font-size-xs'?: string;
    '--font-size-sm'?: string;
    '--font-size-base'?: string;
    '--font-size-md'?: string;
    '--font-size-lg'?: string;
    '--font-size-xl'?: string;
    '--font-size-2xl'?: string;
    '--font-size-3xl'?: string;
    '--font-size-4xl'?: string;
    '--font-size-5xl'?: string;
    '--font-size-6xl'?: string;
    
    '--line-height-none'?: string;
    '--line-height-tight'?: string;
    '--line-height-snug'?: string;
    '--line-height-normal'?: string;
    '--line-height-relaxed'?: string;
    '--line-height-loose'?: string;
    
    '--letter-spacing-tighter'?: string;
    '--letter-spacing-tight'?: string;
    '--letter-spacing-normal'?: string;
    '--letter-spacing-wide'?: string;
    '--letter-spacing-wider'?: string;
    '--letter-spacing-widest'?: string;
    
    '--spacing-0'?: string;
    '--spacing-0.5'?: string;
    '--spacing-1'?: string;
    '--spacing-1.5'?: string;
    '--spacing-2'?: string;
    '--spacing-2.5'?: string;
    '--spacing-3'?: string;
    '--spacing-3.5'?: string;
    '--spacing-4'?: string;
    '--spacing-5'?: string;
    '--spacing-6'?: string;
    '--spacing-7'?: string;
    '--spacing-8'?: string;
    '--spacing-9'?: string;
    '--spacing-10'?: string;
    '--spacing-11'?: string;
    '--spacing-12'?: string;
    '--spacing-14'?: string;
    '--spacing-16'?: string;
    '--spacing-20'?: string;
    '--spacing-24'?: string;
    
    '--animation-duration-instant'?: string;
    '--animation-duration-fast'?: string;
    '--animation-duration-normal'?: string;
    '--animation-duration-slow'?: string;
    '--animation-duration-slower'?: string;
    '--animation-duration-slowest'?: string;
    
    '--animation-easing-ease'?: string;
    '--animation-easing-linear'?: string;
    '--animation-easing-ease-in'?: string;
    '--animation-easing-ease-out'?: string;
    '--animation-easing-ease-in-out'?: string;
    '--animation-easing-spring'?: string;
    '--animation-easing-spring-stiff'?: string;
    
    '--touch-target-minimum'?: string;
    '--touch-target-comfortable'?: string;
    '--touch-target-large'?: string;
    
    '--z-index-hide'?: string;
    '--z-index-base'?: string;
    '--z-index-dropdown'?: string;
    '--z-index-sticky'?: string;
    '--z-index-overlay'?: string;
    '--z-index-modal'?: string;
    '--z-index-popover'?: string;
    '--z-index-toast'?: string;
    '--z-index-tooltip'?: string;
  }
}