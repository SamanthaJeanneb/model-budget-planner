import type { ReactNode } from "react";

/** Rows of label / value inside a chart tooltip. */
export function Tip({ title, children }: { title: ReactNode; children: ReactNode }) {
  return (
    <div className="min-w-48 space-y-1.5 py-0.5">
      <p className="text-[13px] font-medium text-ink">{title}</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-0.5 text-xs">{children}</dl>
    </div>
  );
}

export function TipRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-ink-3">{label}</dt>
      <dd className="text-right text-ink tabular-nums">{children}</dd>
    </>
  );
}
