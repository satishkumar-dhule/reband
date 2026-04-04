import { motion } from 'framer-motion';
import { CheckCircle, Terminal, ChevronRight, Building2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { DiffBadge, diffColor } from './DiffBadge';
import type { CodingChallenge as Challenge } from '../../lib/coding-challenges';

interface ChallengeCardProps {
  challenge: Challenge;
  solved: boolean;
  onClick: () => void;
}

export function ChallengeCard({ challenge, solved, onClick }: ChallengeCardProps) {
  const dc = diffColor(challenge.difficulty);
  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      onClick={onClick}
      data-testid={`card-challenge-${challenge.id}`}
      className={cn(
        'group relative cursor-pointer rounded-xl border overflow-hidden transition-all',
        solved
          ? 'border-emerald-500/25 bg-[var(--gh-canvas-subtle)]'
          : 'border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] hover:border-[var(--gh-accent-fg)]/50',
      )}
    >
      {solved && <div className="absolute inset-0 bg-emerald-500/3 pointer-events-none" />}

      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center border',
              solved ? 'bg-emerald-500/12 border-emerald-500/30' : 'bg-[var(--gh-canvas-subtle)] border-[var(--gh-border)]'
            )}>
              {solved
                ? <CheckCircle className="w-4 h-4 text-emerald-400" />
                : <Terminal className="w-4 h-4 text-[var(--gh-accent-fg)]" />}
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--gh-fg-muted)]">
              {challenge.category}
            </span>
          </div>
          <DiffBadge d={challenge.difficulty} />
        </div>

        <h3 className="text-base font-bold text-[var(--gh-fg)] group-hover:text-[var(--gh-accent-fg)] transition-colors mb-2 line-clamp-1">
          {challenge.title}
        </h3>
        <p className="text-xs text-[var(--gh-fg-muted)] line-clamp-2 leading-relaxed mb-4">
          {challenge.description}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-[var(--gh-border)]/50">
          <div className="flex items-center gap-3">
            {challenge.tags?.slice(0, 2).map(t => (
              <span key={t} className="text-[9px] text-[var(--gh-fg-muted)] font-mono">#{t}</span>
            ))}
          </div>
          <div className="flex items-center gap-3 text-[10px] text-[var(--gh-fg-muted)]">
            {challenge.companies?.slice(0, 2).map(c => (
              <span key={c} className="flex items-center gap-0.5">
                <Building2 className="w-2.5 h-2.5" />
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="w-4 h-4 text-[var(--gh-accent-fg)]" />
      </div>
    </motion.div>
  );
}
