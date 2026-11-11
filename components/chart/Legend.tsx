/** Swatch-and-label legend; labels stay in ink, the swatch carries the colour. */
export function Legend({ items }: { items: { label: string; color: string }[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5 text-xs text-ink-2">
          <span className="size-2 rounded-full" style={{ background: i.color }} aria-hidden />
          {i.label}
        </li>
      ))}
    </ul>
  );
}
