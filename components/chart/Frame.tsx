import type { ReactNode } from "react";

/** A chart card: title, an optional legend or note on the right, and the plot. */
export function Frame({ title, note, children }: { title: string; note?: ReactNode; children: ReactNode }) {
  return (
    <section className="rounded-xl bg-subtle p-5 ring-1 ring-line-soft">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
        <h2 className="text-[13px] font-semibold text-ink">{title}</h2>
        {note ? <div className="text-xs text-ink-2">{note}</div> : null}
      </div>
      {children}
    </section>
  );
}
