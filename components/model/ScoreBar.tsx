/** A thin 0–100 bar; `best` draws a tick where the top allowed model sits. */
export function ScoreBar({
  value,
  best,
  className = "w-20",
}: {
  value: number;
  best?: number;
  className?: string;
}) {
  return (
    <span className={`relative inline-block h-1 rounded-full bg-line-soft ${className}`} aria-hidden>
      <span
        className="absolute inset-y-0 left-0 rounded-full bg-accent"
        style={{ width: `${Math.min(100, value)}%` }}
      />
      {best !== undefined && best > value ? (
        <span className="absolute -top-0.5 h-2 w-px bg-ink-3" style={{ left: `${Math.min(100, best)}%` }} />
      ) : null}
    </span>
  );
}
