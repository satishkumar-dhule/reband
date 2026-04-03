import { useMemo } from "react";
import { Activity } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * ContributionGrid displays a GitHub-style activity heatmap.
 * This component is lazy-loaded to not block initial page paint.
 */
export default function ContributionGrid() {
  const weeks = 15;
  const days = 7;
  const levels = [0, 1, 2, 3, 4];
  
  const cells = useMemo(() => {
    const seed = 12345;
    let random = seed;
    const nextRandom = () => {
      random = (random * 1103515245 + 12345) & 0x7fffffff;
      return random / 0x7fffffff;
    };
    return Array.from({ length: weeks }, () =>
      Array.from({ length: days }, () => {
        const val = nextRandom();
        if (val < 0.4) return 0;
        if (val < 0.6) return 1;
        if (val < 0.75) return 2;
        if (val < 0.9) return 3;
        return 4;
      })
    );
  }, []);

  const colorMap = [
    "bg-[var(--gh-canvas-inset)]",
    "bg-[hsl(136_70%_20%)]",
    "bg-[hsl(136_70%_30%)]",
    "bg-[hsl(136_70%_42%)]",
    "bg-[var(--gh-success-emphasis)]",
  ];

  return (
    <div>
      <div className="flex gap-1">
        {cells.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((level, di) => (
              <div
                key={di}
                className={cn("w-3 h-3 rounded-sm", colorMap[level])}
                title={`Level ${level}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-end gap-1.5 mt-2">
        <span className="text-[10px] text-[var(--gh-fg-muted)]">Less</span>
        {levels.map((l) => (
          <div key={l} className={cn("w-3 h-3 rounded-sm", colorMap[l])} />
        ))}
        <span className="text-[10px] text-[var(--gh-fg-muted)]">More</span>
      </div>
    </div>
  );
}
