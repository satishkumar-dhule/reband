import { cn } from '../../lib/utils';

export function diffColor(d?: string) {
  if (d === 'easy') return { bg: 'bg-emerald-500/12', text: 'text-emerald-400', border: 'border-emerald-500/30' };
  if (d === 'hard') return { bg: 'bg-red-500/12', text: 'text-red-400', border: 'border-red-500/30' };
  return { bg: 'bg-amber-500/12', text: 'text-amber-400', border: 'border-amber-500/30' };
}

export function DiffBadge({ d }: { d?: string }) {
  const c = diffColor(d);
  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border', c.bg, c.text, c.border)}>
      {d ?? 'medium'}
    </span>
  );
}
