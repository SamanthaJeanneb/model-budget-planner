import type { ReactNode } from "react";

/** The one grey tag a row may carry. */
export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-5 items-center rounded px-1.5 text-xs font-medium text-ink-2 ring-1 ring-line ring-inset">
      {children}
    </span>
  );
}
