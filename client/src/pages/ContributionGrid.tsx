import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface ActivityStat {
  date: string; // YYYY-MM-DD
  count: number;
}

interface Props {
  stats?: ActivityStat[];
  weeks?: number;
}

/**
 * ContributionGrid — GitHub-style heatmap built from real activity-stats localStorage data.
 * Each cell is one day; colour intensity = questions answered that day.
 */
export default function ContributionGrid({ stats: statsProp, weeks = 17 }: Props) {
  // Read from localStorage if stats not passed as prop
  const stats: ActivityStat[] = useMemo(() => {
    if (statsProp) return statsProp;
    try {
      const raw = localStorage.getItem("activity-stats");
      return raw ? (JSON.parse(raw) as ActivityStat[]) : [];
    } catch {
      return [];
    }
  }, [statsProp]);

  // Build a date → count lookup map
  const countByDate = useMemo(() => {
    const m: Record<string, number> = {};
    for (const s of stats) {
      m[s.date] = (m[s.date] ?? 0) + s.count;
    }
    return m;
  }, [stats]);

  // Max count (for scaling intensity)
  const maxCount = useMemo(() =>
    Math.max(1, ...Object.values(countByDate)),
    [countByDate]
  );

  // Build grid: weeks columns × 7 rows (Sun–Sat)
  // Start from the first Sunday on or before (weeks * 7) days ago
  const grid = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find the most recent Saturday (end of current week)
    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - weeks * 7 + 1);

    const columns: Array<{ date: Date; dateStr: string; count: number; level: number }[]> = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const col: typeof columns[0] = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = current.toISOString().split("T")[0];
        const count = countByDate[dateStr] ?? 0;
        const isFuture = current > today;
        const level = isFuture
          ? -1 // future — hidden
          : count === 0
          ? 0
          : count <= 2
          ? 1
          : count <= 5
          ? 2
          : count <= 9
          ? 3
          : 4;
        col.push({ date: new Date(current), dateStr, count, level });
        current.setDate(current.getDate() + 1);
      }
      columns.push(col);
    }
    return columns;
  }, [countByDate, weeks]);

  // Month labels — show month name when a new month starts
  const monthLabels = useMemo(() => {
    const labels: { colIndex: number; label: string }[] = [];
    let lastMonth = -1;
    grid.forEach((col, ci) => {
      const month = col[0].date.getMonth();
      if (month !== lastMonth) {
        labels.push({
          colIndex: ci,
          label: col[0].date.toLocaleString("default", { month: "short" }),
        });
        lastMonth = month;
      }
    });
    return labels;
  }, [grid]);

  const totalThisYear = useMemo(() => {
    const year = new Date().getFullYear().toString();
    return Object.entries(countByDate)
      .filter(([d]) => d.startsWith(year))
      .reduce((s, [, c]) => s + c, 0);
  }, [countByDate]);

  const colorMap = [
    "bg-[var(--gh-canvas-inset)] border border-[var(--gh-border-muted)]/40",
    "bg-[hsl(136_60%_22%)]",
    "bg-[hsl(136_65%_32%)]",
    "bg-[hsl(136_70%_42%)]",
    "bg-[var(--gh-success-emphasis)]",
  ];

  const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const SHOW_DAYS = [1, 3, 5]; // Mon, Wed, Fri

  const cellSize = "w-3 h-3";

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[var(--gh-fg-muted)]">
          <span className="font-medium text-[var(--gh-fg)]">{totalThisYear}</span>{" "}
          questions answered this year
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-[var(--gh-fg-muted)]">Less</span>
          {[0, 1, 2, 3, 4].map((l) => (
            <div key={l} className={cn(cellSize, "rounded-sm", colorMap[l])} />
          ))}
          <span className="text-[10px] text-[var(--gh-fg-muted)]">More</span>
        </div>
      </div>

      <div className="flex gap-1">
        {/* Day-of-week labels */}
        <div className="flex flex-col gap-1 pr-1">
          {DAY_LABELS.map((d, i) => (
            <div key={d} className={cn("h-3 flex items-center", cellSize)}>
              {SHOW_DAYS.includes(i) ? (
                <span className="text-[9px] text-[var(--gh-fg-muted)] leading-none">{d[0]}</span>
              ) : null}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="flex flex-col gap-1 relative">
          {/* Month labels row */}
          <div className="flex gap-1 h-3 relative">
            {grid.map((col, ci) => {
              const label = monthLabels.find((m) => m.colIndex === ci);
              return (
                <div key={ci} className={cn("relative", cellSize)}>
                  {label && (
                    <span className="absolute left-0 top-0 text-[9px] text-[var(--gh-fg-muted)] leading-none whitespace-nowrap">
                      {label.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Columns */}
          <div className="flex gap-1">
            {grid.map((col, ci) => (
              <div key={ci} className="flex flex-col gap-1">
                {col.map((cell) => (
                  <div
                    key={cell.dateStr}
                    className={cn(
                      cellSize,
                      "rounded-sm transition-opacity",
                      cell.level === -1
                        ? "opacity-0"
                        : colorMap[cell.level]
                    )}
                    title={
                      cell.level === -1
                        ? ""
                        : cell.count === 0
                        ? `${cell.date.toLocaleDateString("default", { month: "short", day: "numeric" })} — no activity`
                        : `${cell.date.toLocaleDateString("default", { month: "short", day: "numeric" })} — ${cell.count} question${cell.count !== 1 ? "s" : ""}`
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
