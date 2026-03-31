export const SRS_CONFIG = {
  intervals: {
    first: 1,
    second: 6,
  },
  easeFactor: {
    minimum: 1.3,
    default: 2.5,
  },
  hours: {
    level0: 4,
    level1: 24,
    level2: 72,
    level3: 168,
    level4: 336,
    level5: 720,
    level6: 2160,
    level7: 4320,
  },
  scoreThreshold: {
    pass: 80,
    minimum: 3,
  },
} as const;

export type SRSConfig = typeof SRS_CONFIG;
