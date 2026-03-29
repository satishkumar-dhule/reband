/**
 * Confetti Animation Component
 * Celebratory particle effect for achievements
 */

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  color: string;
  delay: number;
  rotation: number;
  scale: number;
}

// Muted, photosensitivity-friendly colors
const MUTED_COLORS = [
  '#8b8b8b', // gray
  '#6b7280', // cool gray
  '#78716c', // stone
  '#a1a1aa', // zinc
  '#94a3b8', // slate
];

// Standard colors (for when user has not indicated preference)
const STANDARD_COLORS = [
  '#a855f7', // purple
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#ec4899', // pink
  '#06b6d4', // cyan
];

const SHAPES = ['●', '■', '▲', '★', '♦'];

// Reduced particle count for photosensitivity
const DEFAULT_PARTICLES = 30;
const REDUCED_PARTICLES = 15;

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

  // Skip animation entirely if user prefers reduced motion
  if (shouldReduceMotion) {
    return null;
  }

  useEffect(() => {
    if (isActive) {
      const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.5,
        rotation: Math.random() * 360,
        scale: 0.5 + Math.random() * 0.5,
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => setParticles([]), duration);
      return () => clearTimeout(timer);
    }
  }, [isActive, duration, particleCount, colors]);

  // Provide a way to toggle confetti style (for accessibility preferences)
  // This can be connected to a settings panel in the future
  const toggleMuted = useCallback(() => {
    setPreference(useMuted === true ? false : true);
  }, [useMuted, setPreference]);

  return (
    <AnimatePresence>
      {particles.length > 0 && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden" role="status" aria-live="polite" aria-label="Celebration">
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ 
                y: -20, 
                x: `${particle.x}vw`,
                opacity: 1,
                rotate: 0,
                scale: particle.scale
              }}
              animate={{ 
                y: '110vh',
                rotate: particle.rotation + 720,
                opacity: [1, 1, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 2.5 + Math.random(),
                delay: particle.delay,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
              style={{ color: particle.color }}
              className="absolute text-2xl"
              aria-hidden="true"
            >
              {SHAPES[particle.id % SHAPES.length]}
            </motion.div>
          ))}
        </div>
      )}
    </AnimatePresence>
  );
}

export default Confetti;
