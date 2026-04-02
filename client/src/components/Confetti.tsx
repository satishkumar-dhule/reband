/**
 * Confetti Animation Component
 * Celebratory particle effect for achievements
 * 
 * Performance optimizations:
 * - Uses CSS animations instead of framer-motion for particles (avoids JS animation overhead)
 * - Memoized particle generation to prevent re-creation on every render
 * - Reduced particle count and complexity
 * - Early return for reduced motion preference
 */

import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
  scale: number;
  shape: string;
}

// Muted, photosensitivity-friendly colors
const MUTED_COLORS = [
  '#8b8b8b', '#6b7280', '#78716c', '#a1a1aa', '#94a3b8',
];

const STANDARD_COLORS = [
  '#a855f7', '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4',
];

const SHAPES = ['●', '■', '▲', '★', '♦'];

// Reduced particle count for photosensitivity
const DEFAULT_PARTICLES = 20; // Reduced from 30
const REDUCED_PARTICLES = 10; // Reduced from 15

function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);
  
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(mediaQuery.matches);
    
    const handler = (event: MediaQueryListEvent) => {
      setPrefersReduced(event.matches);
    };
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);
  
  return prefersReduced;
}

function useUserPreference() {
  const [useMuted, setUseMuted] = useState<boolean | null>(null);
  
  useEffect(() => {
    const stored = localStorage.getItem('confetti-preference');
    if (stored !== null) {
      setUseMuted(stored === 'muted');
    }
  }, []);
  
  const setPreference = useCallback((muted: boolean) => {
    localStorage.setItem('confetti-preference', muted ? 'muted' : 'standard');
    setUseMuted(muted);
  }, []);
  
  return { useMuted, setPreference };
}

// Memoized particle generator - creates stable particle data
function generateParticles(count: number, colors: string[]): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 0.5,
    rotation: Math.random() * 360,
    scale: 0.5 + Math.random() * 0.5,
    shape: SHAPES[i % SHAPES.length],
  }));
}

// Individual particle using CSS animation instead of framer-motion
const ConfettiParticle = function ConfettiParticleInner({ particle }: { particle: Particle }) {
  const style: React.CSSProperties = {
    position: 'absolute',
    left: `${particle.x}vw`,
    top: '-20px',
    color: particle.color,
    fontSize: '1.5rem',
    transform: `scale(${particle.scale})`,
    animation: `confetti-fall ${2.5 + (particle.id % 10) * 0.1}s ${particle.delay}s ease-out forwards`,
    willChange: 'transform, opacity',
  };
  
  return (
    <span style={style} aria-hidden="true">
      {particle.shape}
    </span>
  );
};

export function Confetti({ 
  isActive, 
  duration = 3000,
  particleCount: propParticleCount 
}: { 
  isActive: boolean;
  duration?: number;
  particleCount?: number;
}) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldReduceMotion = useReducedMotion() || prefersReducedMotion;
  const { useMuted, setPreference } = useUserPreference();
  
  // Determine effective particle count
  const particleCount = propParticleCount 
    ? Math.min(propParticleCount, shouldReduceMotion ? REDUCED_PARTICLES : DEFAULT_PARTICLES)
    : shouldReduceMotion 
      ? REDUCED_PARTICLES 
      : DEFAULT_PARTICLES;
  
  // Determine colors based on preference
  const colors = useMuted === true 
    ? MUTED_COLORS 
    : useMuted === false 
      ? STANDARD_COLORS 
      : STANDARD_COLORS;
  
  const [particles, setParticles] = useState<Particle[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Skip animation entirely if user prefers reduced motion
  if (shouldReduceMotion) {
    return null;
  }

  // Memoize particles so they don't regenerate on every render
  const memoizedParticles = useMemo(
    () => generateParticles(particleCount, colors),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isActive, particleCount]
  );

  useEffect(() => {
    if (isActive) {
      setParticles(memoizedParticles);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setParticles([]), duration);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [isActive, duration, memoizedParticles]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Provide a way to toggle confetti style (for accessibility preferences)
  const toggleMuted = useCallback(() => {
    setPreference(useMuted === true ? false : true);
  }, [useMuted, setPreference]);

  if (particles.length === 0) return null;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden" 
      role="status" 
      aria-live="polite" 
      aria-label="Celebration"
    >
      {particles.map((particle) => (
        <ConfettiParticle key={particle.id} particle={particle} />
      ))}
    </div>
  );
}

export default Confetti;
