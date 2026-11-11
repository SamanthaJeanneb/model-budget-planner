/** A small inline bar for a 0–100 score, with the figure beside it. */
export function ScoreBar({ value, max = 100 }: { value: number; max?: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <span className="inline-flex items-center gap-2">
      <span className="relative h-1.5 w-16 overflow-hidden rounded-full bg-line-soft" aria-hidden>
        <span className="absolute inset-y-0 left-0 rounded-full bg-accent" style={{ width: `${pct}%` }} />
      </span>
      <span className="text-sm text-ink tabular-nums">{value.toFixed(1)}</span>
    </span>
  );
}
