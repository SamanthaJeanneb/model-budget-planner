import type { ReactNode } from "react";
import type { ScoreKind } from "@/domain/types";

type Props = { kind: ScoreKind; active: ScoreKind; onSort: (kind: ScoreKind) => void; children: ReactNode };

export function SortHeader({ kind, active, onSort, children }: Props) {
  const on = kind === active;
  return (
    <th className="w-28 py-2 pr-4 text-right font-normal" aria-sort={on ? "descending" : "none"}>
      <button
        type="button"
        onClick={() => onSort(kind)}
        className={`inline-flex items-center gap-1 rounded px-1 hover:bg-subtle hover:text-ink ${on ? "font-medium text-ink" : ""}`}
      >
        {children}
        <svg viewBox="0 0 10 10" className={`size-2.5 ${on ? "" : "invisible"}`} aria-hidden>
          <path d="M2 3.5 5 6.5l3-3" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>
    </th>
  );
}
