import { useState, useEffect } from 'react';
import { Timer } from 'lucide-react';

export function LiveTimer({ startTime }: { startTime: number }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(id);
  }, [startTime]);
  const m = Math.floor(elapsed / 60);
  const s = elapsed % 60;
  return (
    <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--gh-fg-muted)]">
      <Timer className="w-3.5 h-3.5" />
      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </div>
  );
}
